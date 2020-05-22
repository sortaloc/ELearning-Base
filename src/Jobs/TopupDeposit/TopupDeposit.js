
require('module-alias/register')

const { STRUCTURE } = require('@Config/Config');
const database = require('@Model/index');
let MainController = require('@Controllers/MainController');

MainController = new MainController();

const processing = async () => {
    return new Promise(async (resolve) => {
        let data = await database.inbox.allSelect({ibx_tipe: 'TOPUPDEPOSIT', 'ibx_status': 'Q'});

        /*
        Step By Step
        1. Update Inbox;
        2. Buat Transaksi
        3. Buat Jurnal /Tambah saldo ke profile dan ke account
        3. Update Transaksi
        4. Send Notif Firebase
        5. Update Status Inbox and Send Outbox
        */

        if(data.length === 0){
            // console.log('hehehe')
            return resolve(true);
        }else{
            // Do Jobs
            for(let idx = 0; idx < data.length; idx++){
                let inbox = data[idx];

                let deposit = await database.deposit.single({dep_refid: inbox.ibx_refid});

                let akun = await database.profile.single({})

                let transaction = {
                    trx_id: MainController.generateID(),
                    trx_keterangan: 'Transaksi sedang dalam proses',
                    trx_tipe: inbox.ibx_tipe,
                    trx_id_tipe: 'TOPUP',
                    trx_harga: deposit.dep_nominal,
                    trx_fee: deposit.dep_kode_unik,
                    trx_total_harga: deposit.dep_total,
                    trx_saldo_before: akun.prl_saldo,
                    trx_saldo_after: Number(akun.prl_saldo) + Number(deposit.dep_nominal),
                    trx_status: '1',
                    trx_id_profile: akun.prl_profile_id,
                    trx_code_voucher: '',
                    trx_invoice: MainController.createInvoice('TOPUP'),
                    trx_refid: inbox.ibx_refid,
                }

                // let insertTrx = await database.transaksi.insert(transaction);
                let jurnal1 = {
                    cf_keterangan: 'Penambahan ke penampungan internal',
                    cf_tipe: 'topup',
                    cf_kredit: 0,
                    cf_debet: deposit.dep_total,
                    cf_nominal: deposit.dep_total,
                    cf_refid: inbox.ibx_refid,
                    cf_internal_acc: 20200506045039801303,
                    cf_profile_id: akun.prl_profile_id
                }

                let nexus = deposit.dep_nominal / 15000;

                let jurnal2 = {
                    cf_keterangan: `Pengurangan ke Akun ${akun.prl_profile_id} dengan nilai ${deposit.dep_nominal} dengan nilai konversi nexus menjadi '${nexus} Nexus'`,
                    cf_tipe: 'topup',
                    cf_kredit: deposit.dep_nominal,
                    cf_debet: 0,
                    cf_nominal: deposit.dep_nominal,
                    cf_refid: inbox.ibx_refid,
                    cf_internal_acc: 20200506045039801303,
                    cf_profile_id: akun.prl_profile_id
                }

                let jurnal3 = {
                    cf_keterangan: 'Penambahan ke Saldo Penampungan Keuntungan Topup',
                    cf_tipe: 'topup',
                    cf_kredit: deposit.dep_kode_unik,
                    cf_debet: 0,
                    cf_nominal: Number(deposit.dep_total) - Number(deposit.dep_nominal),
                    cf_refid: inbox.ibx_refid,
                    cf_internal_acc: 20200506045509647299,
                    cf_profile_id: akun.prl_profile_id
                }

                let cashflow = await database.cashflow.insert([jurnal1, jurnal2, jurnal3])



                // console.log(cashflow)

                // console.log(jurnal1, jurnal2, jurnal3);

                // Kredit ke cashflow
                // Penambahan ke akun
                // 20200506045039801303



                // console.log(insertTrx);

                // console.log(deposit.dep_id_profile, akun.prl_profile_id)
                // console.log(d);
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
        /*MainController.getSleep()*/
    })
}
setTimeout(() => startCron());