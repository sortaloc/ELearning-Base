
require('module-alias/register')

const database = require('@Model/index');
let MainController = require('@Controllers/MainController');

MainController = new MainController();

const processing = async () => {
    return new Promise(async (resolve) => {
        let data = await database.deposit.connection.raw(
            `SELECT * FROM
            deposit
            WHERE
            dep_expired < '${MainController.createDate(0)}'
            AND dep_status = 0
            `

        )

        let depSuccess = new Array();

        if(data.rows.length === 0){
            // console.log('Tidak ada Data');
            return resolve(true);
        }else{
            data = data.rows;
            try{
                for(let idx = 0; idx < data.length; idx++){
                    let deposit = data[idx];

                    let exprDate = new Date(deposit.dep_expired)

                    let nowDate = new Date(MainController.createDate(0));

                    if(nowDate > exprDate){
                        console.log('Sudah Expire')
                    }

                    // Update Deposit to 3 -> Expired

                    let update = await database.deposit.updateOne({dep_id: deposit.dep_id, dep_refid: deposit.dep_refid}, {dep_status: 3});
                    if(update.state){
                        depSuccess.push(deposit.dep_id)
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