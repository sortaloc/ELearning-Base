
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

                // let trxID = MainController.generateID();
                // let trxINV = MainController.createInvoice('TOPUP');
                // let transaksi = {
                //     trx_id: trxID,
                //     trx_keterangan: 'Transaksi sedang dalam proses',
                //     trx_tipe: inbox.ibx_tipe,
                //     trx_id_tipe: 'TOPUP',
                //     trx_harga: deposit.dep_nominal,
                //     trx_fee: deposit.dep_kode_unik,
                //     trx_total_harga: deposit.dep_total,
                //     trx_saldo_before: akun.prl_saldo,
                //     trx_saldo_after: Number(akun.prl_saldo) + Number(deposit.dep_nominal),
                //     trx_status: '1',
                //     trx_id_profile: akun.prl_profile_id,
                //     trx_code_voucher: '',
                //     trx_invoice: trxINV,
                //     trx_refid: inbox.ibx_refid,
                // }

                // let insertTrx = await database.transaksi.insert(transaksi);

                // let internal1 = '20200506045039801303';
                // let jurnal1 = {
                //     cf_keterangan: 'Penambahan ke penampungan internal',
                //     cf_tipe: 'topup',
                //     cf_kredit: 0,
                //     cf_debet: deposit.dep_total,
                //     cf_nominal: deposit.dep_total,
                //     cf_refid: inbox.ibx_refid,
                //     cf_internal_acc: internal1,
                //     cf_profile_id: akun.prl_profile_id
                // }

                // let query = `UPDATE account SET acc_saldo = acc_saldo + ${deposit.dep_total} WHERE acc_noakun = '${internal1}'`
                // let updateAkun1 = await database.account.connection.raw(query);

                // if(updateAkun1.rowCount > 0){
                    let nexus = Math.floor(deposit.dep_nominal / 15000);

                //     let jurnal2 = {
                //         cf_keterangan: `Pengurangan ke Akun ${akun.prl_profile_id} dengan nilai ${deposit.dep_nominal} dengan nilai konversi nexus menjadi '${nexus} Nexus'`,
                //         cf_tipe: 'topup',
                //         cf_kredit: deposit.dep_nominal,
                //         cf_debet: 0,
                //         cf_nominal: deposit.dep_nominal,
                //         cf_refid: inbox.ibx_refid,
                //         cf_internal_acc: 0,
                //         cf_profile_id: akun.prl_profile_id
                //     }

                //     query = `UPDATE profile SET prl_saldo = prl_saldo + ${deposit.dep_nominal}, prl_saldo_nexus = prl_saldo_nexus + ${nexus} WHERE prl_profile_id = '${akun.prl_profile_id}'`;
                //     let updateAkun2 = await database.account.connection.raw(query);
                //     if(updateAkun2.rowCount > 0){
                //         let jurnal3 = {
                //             cf_keterangan: 'Penambahan ke Saldo Penampungan Keuntungan Topup',
                //             cf_tipe: 'topup',
                //             cf_kredit: deposit.dep_kode_unik,
                //             cf_debet: 0,
                //             cf_nominal: deposit.dep_kode_unik,
                //             cf_refid: inbox.ibx_refid,
                //             cf_internal_acc: '20200506045509647299',
                //             cf_profile_id: akun.prl_profile_id
                //         }

                //         let query = `UPDATE account SET acc_saldo = acc_saldo + ${deposit.dep_kode_unik} WHERE acc_noakun = '${jurnal3.cf_internal_acc}'`
                //         let updateAkun1 = await database.account.connection.raw(query);

                //         let cashflow = await database.cashflow.insert([jurnal1, jurnal2, jurnal3])

                //         if(cashflow.state){
                //             // update status inbox
                //             // Update status transaksi
                //             // Update status deposit
                //             // Insert Outbox
                //             // Send Firebase

                //             let updateDeposit = await database.deposit.updateOne({dep_id: deposit.dep_id}, {dep_status: 4});
                //             let updateInbox = await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'S'});
                            let keteranganTrx = `Berhasil Topup sebesar Rp.${deposit.dep_nominal} menjadi ${nexus} Nexus Poin`;
                //             let updateTransaksi = await database.transaksi.updateOne({trx_id: trxID, trx_invoice: trxINV, trx_refid: inbox.ibx_refid}, {trx_saldo_after: deposit.dep_nominal, trx_status: 'S', trx_keterangan: keteranganTrx, , trx_updated_at: MainController.createDate(0)})

                //             let Outbox = {
                //                 obx_refid: refid,
                //                 obx_id_profile: akun.akun,
                //                 obx_interface: 'H',
                //                 obx_tipe: 'BUYCERITICATE',
                //                 obx_status: 'S',
                //                 obx_format_msg: inbox.ibx_format_msg,
                //                 obx_keterangan: `Berhasil input ke Outbox pada ${this.createDate(0)}`,
                //                 obx_raw_data: JSON.stringify(transaksi)
                //             }

                            let notifData = {
                              data: {
                                id: akun.prl_profile_id,
                                tipe: 'default',
                                title: 'Transfer Akun Gagal',
                                message: keteranganTrx,
                                nama_sender: 'Prexus'
                              }
                            }
                            console.log(notifData);
                //             process.exit();
                //             // MainController.sendNotif(notifData)

                //             // console.log(updateTransaksi);
                //         }
                //     }
                    
                // }
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