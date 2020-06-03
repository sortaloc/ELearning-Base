
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
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const processing = async () => {
    return new Promise(async (resolve) => {
        let data = await database.inbox.allSelect({ibx_tipe: 'BUYPROFISIENSI', 'ibx_status': 'Q'});

        // console.log(await database);
        // process.exit()

        let ibxSucc = new Array();

        if(data.length === 0){
            return resolve(true);
        }else{
            try{
                for(let idx = 0; idx < data.length; idx++){
                    let inbox = data[idx];
                    let FormatMsg = MainController.FormatMsg(inbox.ibx_format_msg.split('.'));
                    let produk = await database.produk.allSelect({produk_id: FormatMsg.productid, produk_kodeProduk: FormatMsg.kode});
                    let akun = await database.profile.single({prl_profile_id: FormatMsg.profileid});
                    let transaksi = await database.transaksi.allSelect({trx_refid: inbox.ibx_refid})

                    if(transaksi.length === 0 || produk.length === 0){
                        await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'G'});
                        continue;
                    }

                    transaksi = transaksi[0];
                    produk = produk[0];

                    let pemateri = await database.profile.single({prl_profile_id: produk.produk_pemateri_id})

                    var globalData = {
                        transaksi, pemateri, produk, akun, inbox
                    }

                    let realHarga = Number(produk.produk_harga) /** 15000*/
                    let nexus = Number(produk.produk_harga)

                    let jurnal1 = {
                        cf_keterangan: `Pengurangan Nexus dari profile ${akun.prl_profile_id} sebesar ${produk.produk_harga} Nexus seharga ${realHarga} Rupiah`,
                        cf_tipe: 'buy',
                        cf_kredit: realHarga,
                        cf_debet: 0,
                        cf_nominal: produk.produk_harga + ' Nexus',
                        cf_refid: inbox.ibx_refid,
                        cf_internal_acc: '',
                        cf_profile_id: akun.prl_profile_id
                    }

                    let query = `UPDATE profile SET prl_saldo_nexus = prl_saldo_nexus - ${nexus}, prl_saldo = prl_saldo - ${realHarga} WHERE prl_profile_id = '${akun.prl_profile_id}'`;
                    let updateSaldo = await database.profile.connection.raw(query);

                    if(updateSaldo.rowCount > 0){
                        let penampung = '20200604225152852310'
                        let jurnal2 = {
                            cf_keterangan: `Penambahan ke account Penampungan Profisiensi dengan id: '${penampung}' degan pembelian Profisiensi seharga ${nexus} Nexus dikonversikan menjadi ${realHarga} Rupiah`,
                            cf_tipe: 'buy',
                            cf_kredit: 0,
                            cf_debet: realHarga,
                            cf_nominal: nexus + ' Nexus',
                            cf_refid: inbox.ibx_refid,
                            cf_internal_acc: penampung,
                            cf_profile_id: akun.prl_profile_id
                        }
                        query = `UPDATE account SET acc_saldo = acc_saldo + ${realHarga} WHERE acc_noakun = '${penampung}'`
                        updateSaldo = await database.account.connection.raw(query);

                        if(updateSaldo.rowCount > 0){

                            let username = `PREXUX${akun.prl_nohp}${MainController.makeid(5)}`
                            let password = produk.produk_kodeProduk + MainController.makeid(15)

                            let dataRaw = {
                                username: username,
                                password: password,
                                passwordenc: MainController.createPassword(password),
                                web: produk.produk_link,
                                namapemateri: pemateri.prl_nama,
                                idpemateri: pemateri.prl_profile_id
                            }

                            let prfData = {
                                prf_id: MainController.generateID(),
                                prf_raw: JSON.stringify(dataRaw),
                                prf_profile_id: akun.prl_profile_id,
                                prf_trx_id: transaksi.trx_id,
                                prf_username: username,
                                prf_password: dataRaw.passwordenc,
                                prf_refid: inbox.ibx_refid
                            }

                            let insertProfisiensi = await database.profisiensi.insertOne(prfData);

                            if(insertProfisiensi.state){
                                let cashflow = await database.cashflow.insert([jurnal1, jurnal2])
                                dataRaw.acccess = 0;
                                dataRaw.created = MainController.createDate(0);
                                if(cashflow.state){
                                    let keteranganTrx = `Berhasil membeli E-Profisiensi ${produk.produk_namaProduk}, E-Profisiensi dapat di download pada halaman History`;
                                    let updateTransaksi = await database.transaksi.updateOne({trx_id: transaksi.trx_id, trx_invoice: transaksi.trx_invoice, trx_refid: inbox.ibx_refid}, {trx_saldo_after: akun.prl_saldo - realHarga, trx_status: 'S', trx_keterangan: keteranganTrx, trx_updated_at: MainController.createDate(0),trx_data: JSON.stringify(dataRaw)})
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
                                        title: 'Berhasil membeli E-Profisiensi',
                                        message: keteranganTrx,
                                        nama_sender: 'Prexux',
                                        menu: 'trx',
                                        tipe: 'default',

                                        send: 'user'
                                      }
                                    }
                                    const twiml = new MessagingResponse();
                                    await twiml.message(`Anda telah terdaftar pada Kelas '${produk.produk_namaProduk}'\nUsername : *${username}*\nPassword : *${password}*`);
                                    await MainController.sendNotif(notifData)
                                    ibxSucc.push(inbox.ibx_refid);
                                }else{
                                    /*Cashflow State*/
                                    /*kalau cashflow gagal, balikin saldo akun 1 dan akun 2*/
                                }
                            }else{
                                // Failed insert profisiensi
                            }
                        }else{
                            /*Update Akun 2*/
                            /*kalau gagal pengurangan akun 2 error, balikin saldo yang pertama*/
                        }
                    }else{
                        /*Update Akun 1*/
                        /*kalau gagal pengurangan akun, biarin, langsung throw error sadja*/
                    }
                }
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