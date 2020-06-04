
require('module-alias/register')

const database = require('@Model/index');
let MainController = require('@Controllers/MainController');

const moment = require('moment-timezone');

MainController = new MainController();

const processing = async () => {
    return new Promise(async (resolve) => {
        let data = await database.deposit.connection.raw(
            `SELECT * FROM
            otp_list
            WHERE
            otp_status = 0
            `
        )

        let depSuccess = new Array();

        if(data.rows.length === 0){
            return resolve(true);
        }else{
            data = data.rows;
            try{
                for(let idx = 0; idx < data.length; idx++){
                    let d = data[idx];
                    let dateExpire = moment(d.otp_created_at).tz('Asia/Jakarta').add(30, 'minutes')

                    if(Number(moment.tz('Asia/Jakarta').diff(dateExpire, 'minutes')) > 30){
                        // update otp_status menjadi 2 (Expired);
                        let update = await database.otp_list.updateOne({id: d.id, otp_nohp: d.otp_nohp, otp_kode: d.otp_kode}, {otp_status: 2});
                        if(update.state){
                            depSuccess.push(d.id);
                        }
                    }else{
                        continue;
                    }
                }
                resolve(depSuccess)
            }catch(err){
                console.log(err);
                resolve(false);
            }
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