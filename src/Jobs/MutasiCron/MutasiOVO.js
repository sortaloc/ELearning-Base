
require('module-alias/register')

const { STRUCTURE } = require('@Config/Config');
const database = require('@Model/index');
let MainController = require('@Controllers/MainController');

var Jimp = require('jimp')
const fs = require('fs')
const path = require('path')

MainController = new MainController();

const processing = async () => {
    return new Promise(async (resolve) => {
        let service = 'OVO';
        let data = await database.mutasi_bank.connection.raw(`SELECT * FROM mutasi_bank WHERE mutasi_raw LIKE '%${service}%' AND mutasi_status = 0`)
        data = data.rows;

        let mutasiSuccess = new Array();

        if(data.length === 0){
            return resolve(true);
        }else{
            for(let idx = 0; idx < data.length; idx++){
                let mutasi = data[idx];
                await database.mutasi_bank.updateOne({id: mutasi.id}, {mutasi_status: 1});

                let mutasiData = JSON.parse(mutasi.mutasi_raw);

                let listMutasi = {
                    ...mutasiData,
                    ...mutasiData.content
                }
                let loopData = listMutasi.data;

                delete listMutasi.content;
                delete listMutasi.data;

                for(let ida = 0; ida < loopData.length; ida++){
                    let mlist = loopData[ida];

                    let checkListMutasi = await database.list_mutasi.allSelect({service_id: mlist.id});
                    if(checkListMutasi.length === 0){
                        listMutasi = {
                            ...listMutasi,
                            ...mlist,
                            service_id: mlist.id,
                        }
                        delete listMutasi.id;
                        let insert = await database.list_mutasi.insertOne(listMutasi);

                        if(insert.state){
                            // Update row Mutasi
                            mutasiSuccess.push(listMutasi.service_id);
                            continue;
                        }else{
                            // Gagal Insert
                            // Ubah status row mutasi_bank jadi 0 => mengulang lagi
                            await database.mutasi_bank.updateOne({id: mutasi.id}, {mutasi_status: 0});
                            continue;
                        }
                    }else{
                        continue;
                    }
                }
                await database.mutasi_bank.updateOne({id: mutasi.id}, {mutasi_status: 2});
            }
            console.log('[Mutasi Sukses] : ',mutasiSuccess);
            resolve(mutasiSuccess)
        }
    })
}

function startCron () {
    let timeout;
    Promise.all([MainController.commandJobs()])
    .then(processing)
    .then(response => {
        clearTimeout(timeout)
        timeout = setTimeout(startCron, 750)
    })
}
setTimeout(() => startCron());