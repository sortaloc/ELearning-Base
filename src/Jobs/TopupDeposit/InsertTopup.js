
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
        let data = await database.mutasi_bank.connection.raw(
            `SELECT 
            a."id",
            a.dep_id,
            a.dep_total,
            a.dep_kode_unik,
            a.dep_expired,
            a.dep_status,
            a.dep_created_at,
            a.dep_nominal,
            a.dep_bank_kode,
            a.dep_refid,
            lmutasi.service_id,
            lmutasi.amount,
            lmutasi.description,
            lmutasi.balance,
            trx.trx_id_profile,
            trx.trx_invoice,
            trx.trx_harga
            FROM
            deposit a
            JOIN (SELECT * FROM list_mutasi WHERE mutasi_status = 1) lmutasi on lmutasi.refid_trx = a.dep_refid
            JOIN (SELECT * FROM transaksi WHERE trx_status = 'Q') trx on trx.trx_refid = a.dep_refid
            WHERE
            a.dep_status = 1
            `
        )

        let topupSuccess = new Array();

        if(data.rows.length === 0){
            return resolve(true);
        }else{
            data = data.rows;
            for(let idx = 0; idx < data.length; idx++){
                data = data[idx];
                let updateDeposit = await database.deposit.updateOne({dep_refid: data.dep_refid}, {dep_status: 2,dep_updated_at: MainController.createDate(0)});
                let updateMutasi = await database.list_mutasi.updateOne({service_id: data.service_id}, {mutasi_status: 2});

                if(updateDeposit.state && updateMutasi.state){
                    let format_msg = `PAY_TOPUP.DEPOSIT.${data.dep_nominal}.${data.dep_total}.${data.trx_id_profile}.${data.dep_refid}.CRON_SERVICE`;
                    // // `PAY_TOPUP.DEPOSIT.-.[nominal].[id_tujuan].[refid].[admin_profile]`
                    const insertData = {
                        ibx_refid: data.dep_refid,
                        ibx_id_profile: data.trx_id_profile,
                        ibx_interface: 'H',
                        ibx_tipe: 'TOPUPDEPOSIT',
                        ibx_status: 'Q',
                        ibx_format_msg: format_msg,
                        ibx_keterangan: `Berhasil input ke inbox pada ${MainController.createDate(0)}`,
                        ibx_raw_data: JSON.stringify(data)
                    }

                    let insertInbox = await database.inbox.insertOne(insertData);
                    if(insertInbox.state){
                        topupSuccess.push(data.dep_refid);
                        continue;
                    }else{
                        // Update list_mutasi statusnya jadi 1
                        // Update deposit statusnya jadi 1
                        continue;
                    }
                }else{
                    continue;
                }
            }
        }
        console.log(topupSuccess);
        resolve(topupSuccess)
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