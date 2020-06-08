
require('module-alias/register')

const { STRUCTURE, WHATSAPP } = require('@Config/Config');
const database = require('@Model/index');
let MainController = require('@Controllers/MainController');

// var Jimp = require('jimp')
const fs = require('fs')
const path = require('path')

MainController = new MainController();

const { accountSid, authToken } = WHATSAPP;

const client = require('twilio')(accountSid, authToken);

const processing = async () => {
    return new Promise(async (resolve) => {
        let data = await database.inbox.allSelect({ibx_tipe: 'EVENTREDEEM', 'ibx_status': 'Q'});

        let ibxSucc = new Array();

        if(data.length === 0){
            return resolve(true);
        }else{
            try{
                for(let idx = 0; idx < data.length; idx++){
                    let inbox = data[idx];

                    await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'P'});

                    let FormatMsg = MainController.FormatMsg(inbox.ibx_format_msg.split('.'));
                    let eventid = FormatMsg.productid;
                    let kodeevent = FormatMsg.kode;
                    let profileid = FormatMsg.profileid;

                    let akun = await database.profile.single({prl_profile_id: FormatMsg.profileid, prl_isactive: 1});
                    let transaksi = await database.transaksi.allSelect({trx_refid: inbox.ibx_refid})
                    let event = await database.event.allSelect({event_id: eventid, event_kode: kodeevent});

                    if(transaksi.length === 0 || event.length === 0){
                        await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'G'});
                        continue;
                    }

                    transaksi = transaksi[0];
                    event = event[0];

                    let realHarga = Number(event.event_value) /** 15000*/
                    let nexus = Number(event.event_value);

                    let penampung = '20200606122415680972'
                    let jurnal1 = {
                        cf_keterangan: `Pengurangan Nexus dari Akun Internal untuk Event ${event.event_nama} sebesar ${event.event_harga} Nexus`,
                        cf_tipe: 'event',
                        cf_kredit: 0,
                        cf_debet: realHarga,
                        cf_nominal: realHarga + ' Nexus',
                        cf_refid: inbox.ibx_refid,
                        cf_internal_acc: penampung,
                        cf_profile_id: akun.prl_profile_id,
                        cf_mode: 'min_internal'
                    }

                    let query = `UPDATE account set acc_saldo = acc_saldo - ${realHarga} WHERE acc_noakun = '${penampung}'`;
                    let updateInternal = await database.account.connection.raw(query);

                    if(updateInternal.rowCount > 0){
                        penampung = '';
                        let jurnal2 = {
                            cf_keterangan: `Penambahan ke Profile dengan id Profile: '${akun.prl_profile_id}' sebesar ${nexus} Nexus`,
                            cf_tipe: 'buy',
                            cf_kredit: nexus,
                            cf_debet: 0,
                            cf_nominal: nexus + ' Nexus',
                            cf_refid: inbox.ibx_refid,
                            cf_internal_acc: penampung,
                            cf_profile_id: akun.prl_profile_id,
                            cf_mode: 'add_profile'
                        }
                        query = `UPDATE profile SET prl_saldo_nexus = prl_saldo_nexus + ${nexus}, prl_saldo = prl_saldo + ${realHarga} WHERE prl_profile_id = '${akun.prl_profile_id}' AND prl_isactive = 1`;
                        let updateProfile = await database.profile.connection.raw(query);

                        if(updateProfile.rowCount > 0){
                            let cashflow = await database.cashflow.insert([jurnal1, jurnal2]);
                            if(cashflow.state){
                                let keteranganTrx = event.nama;
                                let updateTransaksi = await database.transaksi.updateOne(
                                    {
                                        trx_id: transaksi.trx_id,
                                        trx_invoice: transaksi.trx_invoice,
                                        trx_refid: inbox.ibx_refid
                                    },
                                    {
                                        trx_saldo_after: akun.prl_saldo - realHarga,
                                        trx_status: 'S',
                                        trx_keterangan: keteranganTrx,
                                        trx_updated_at: MainController.createDate(0)
                                    })
                                let updateInbox = await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'S'});
                                let Outbox = {
                                    obx_refid: inbox.ibx_refid,
                                    obx_id_profile: akun.prl_profile_id,
                                    obx_interface: 'H',
                                    obx_tipe: transaksi.trx_tipe,
                                    obx_status: 'S',
                                    obx_format_msg: inbox.ibx_format_msg,
                                    obx_keterangan: `Berhasil input ke Outbox pada ${MainController.createDate(0)}`,
                                    obx_raw_data: JSON.stringify(transaksi)
                                }
                                await database.outbox.insertOne(Outbox)
                                let notifData = {
                                  data: {
                                    id: akun.prl_profile_id,
                                    title: 'Event',
                                    message: keteranganTrx,
                                    nama_sender: 'Prexux',
                                    menu: 'trx',
                                    tipe: 'default',

                                    send: 'user'
                                  }
                                }
                                await MainController.sendNotif(notifData)
                                ibxSucc.push(inbox.ibx_refid);
                            }else{
                                // Cashflow Failed
                            }
                        }else{
                            // Gagal Update jurnal 2
                        }
                    }else{
                        // Gagal Update jurnal 1
                    }
                }
                console.log(ibxSucc)
                resolve(ibxSucc)
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