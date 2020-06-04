
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
        let data = await database.inbox.allSelect({ibx_tipe: 'BUYCERTIFICATE', 'ibx_status': 'Q'});

        let setting = await database.setting.single({st_kode: 'fee_produk'});
        let feepersen = Number(setting.st_value);

        let ibxSucc = new Array();

        if(data.length === 0){
            // console.log('Tidak ada Data');
            return resolve(true);
        }else{
            try{
                for(let idx = 0; idx < data.length; idx++){
                    let inbox = data[idx];

                    await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'P'});

                    let FormatMsg = MainController.FormatMsg(inbox.ibx_format_msg.split('.'));
                    
                    let produk = await database.produk.single({produk_id: FormatMsg.productid, produk_kodeProduk: FormatMsg.kode});
                    let akun = await database.profile.single({prl_profile_id: FormatMsg.profileid, prl_isactive: 1});

                    let transaksi = await database.transaksi.allSelect({trx_refid: inbox.ibx_refid})

                    if(transaksi.length === 0){
                        // update inbox
                        await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'G'});
                        continue;
                    }

                    transaksi = transaksi[0];

                    let realHarga = Number(produk.produk_harga) /** 15000*/
                    let nexus = Number(produk.produk_harga)

                    let fee = realHarga * (feepersen / 100)
                    let feeNexus = nexus * (feepersen / 100);
                    let keuntunganUser = realHarga - fee;
                    let keuntunganUserNexus = nexus - feeNexus;

                    let jurnal1 = {
                        cf_keterangan: `Pengurangan Nexus dari profile ${akun.prl_profile_id} sebesar ${produk.produk_harga} Nexus seharga ${realHarga} Rupiah`,
                        cf_tipe: 'buy',
                        cf_kredit: realHarga,
                        cf_debet: 0,
                        cf_nominal: produk.produk_harga + ' Nexus',
                        cf_refid: inbox.ibx_refid,
                        cf_internal_acc: '',
                        cf_profile_id: akun.prl_profile_id,
                        cf_mode: 'min_user'
                    }

                    let query = `UPDATE profile SET prl_saldo_nexus = prl_saldo_nexus - ${nexus}, prl_saldo = prl_saldo - ${realHarga} WHERE prl_profile_id = '${akun.prl_profile_id}' AND prl_isactive = 1`;
                    let updateSaldo = await database.profile.connection.raw(query);

                    if(updateSaldo.rowCount > 0){
                        let penampung = '20200507215106956376'
                        let jurnal2 = {
                            cf_keterangan: `Penambahan ke account Penampungan Sertifikat dengan id penampung: '${penampung}' degan pembelian Sertifikat seharga ${nexus} Nexus, dengan keuntungan sebesar ${keuntunganUserNexus} Nexus dikonversikan menjadi ${keuntunganUser} Rupiah`,
                            cf_tipe: 'buy',
                            cf_kredit: 0,
                            cf_debet: keuntunganUser,
                            cf_nominal: nexus + ' Nexus',
                            cf_refid: inbox.ibx_refid,
                            cf_internal_acc: penampung,
                            cf_profile_id: akun.prl_profile_id,
                            cf_mode: 'add_internal'
                        }
                        query = `UPDATE account SET acc_saldo = acc_saldo + ${keuntunganUser} WHERE acc_noakun = '${penampung}'`
                        updateSaldo = await database.account.connection.raw(query);

                        if(updateSaldo.rowCount > 0){

                            penampung = '20200605171724213363'
                            let jurnal3 = {
                                cf_keterangan: `Penambahan ke account Penampungan Keuntungan Sertifikat dengan id penampung: '${penampung}' degan pembelian Sertifikat seharga ${nexus} Nexus dengan keuntungan sebesar ${feeNexus} dikonversikan menjadi ${fee} Rupiah`,
                                cf_tipe: 'buy',
                                cf_kredit: 0,
                                cf_debet: fee,
                                cf_nominal: nexus + ' Nexus',
                                cf_refid: inbox.ibx_refid,
                                cf_internal_acc: penampung,
                                cf_profile_id: akun.prl_profile_id,
                                cf_mode: 'add_profit'
                            }
                            query = `UPDATE account SET acc_saldo = acc_saldo + ${fee} WHERE acc_noakun = '${penampung}'`
                            await database.account.connection.raw(query);

                            let imgSource = `../../Source/${produk.produk_certificate}`;
                            let fontSource = '../../Source/Taniya.fnt'
                            let imgPath = path.join(__dirname, imgSource);
                            let fontPath = path.join(__dirname, fontSource);

                            let nameCert = `${MainController.generateID()}_${akun.prl_profile_id}_${produk.produk_certificate}`;
                            let nameExport = `../../Source/${nameCert}`;
                            let exportFile = path.join(__dirname, nameExport);

                            const image = await Jimp.read(imgPath);
                            const font = await Jimp.loadFont(fontPath);

                            var w = image.bitmap.width;
                            var h = image.bitmap.height;

                            let txt = akun.prl_nama

                            var textWidth = Jimp.measureText(font, txt);
                            var textHeight = Jimp.measureTextHeight(font, txt);

                            let x = w/2-textWidth/2;
                            let y = h/2-textHeight/2;

                            if(txt.indexOf(' ') === -1){
                                y = y - 70;
                            }

                            /*Write Image with Text*/
                            await image.print(font, x, y, { 
                                text: txt, 
                                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                            }, textWidth, textHeight);
                            await image.writeAsync(exportFile); //End

                            let cashflow = await database.cashflow.insert([jurnal1, jurnal2, jurnal3])

                            if(cashflow.state){
                                let keteranganTrx = `Berhasil membeli Sertifikat ${produk.produk_namaProduk}, sertifikat dapat di download pada halaman History`;
                                let trxData = {
                                    certificate: nameCert,
                                    created: MainController.createDate(0),
                                    download: 0,
                                    access: 0
                                }
                                let updateTransaksi = await database.transaksi.updateOne({trx_id: transaksi.trx_id, trx_invoice: transaksi.trx_invoice, trx_refid: inbox.ibx_refid}, {trx_saldo_after: akun.prl_saldo - realHarga, trx_status: 'S', trx_keterangan: keteranganTrx, trx_updated_at: MainController.createDate(0),trx_data: JSON.stringify(trxData)})
                                let updateInbox = await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'S'});
                                let Outbox = {
                                    obx_refid: inbox.ibx_refid,
                                    obx_id_profile: akun.prl_profile_id,
                                    obx_interface: 'H',
                                    obx_tipe: 'BUYCERITICATE',
                                    obx_status: 'S',
                                    obx_format_msg: inbox.ibx_format_msg,
                                    obx_keterangan: `Berhasil input ke Outbox pada ${MainController.createDate(0)}`,
                                    obx_raw_data: JSON.stringify(transaksi)
                                }
                                await database.outbox.insertOne(Outbox)
                                let notifData = {
                                  data: {
                                    id: akun.prl_profile_id,
                                    title: 'Berhasil membeli Sertifikat',
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
                                /*Cashflow State*/
                            }
                        }else{
                            /*Update Akun 2*/
                        }
                    }else{
                        /*Update Akun 1*/
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