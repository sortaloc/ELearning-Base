
require('module-alias/register')

const { STRUCTURE } = require('@Config/Config');
const database = require('@Model/index');
let MainController = require('@Controllers/MainController');
const moment = require('moment-timezone');

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
            return resolve(true);
        }else{
            try{
                for(let idx = 0; idx < data.length; idx++){
                    let inbox = data[idx];

                    // await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'P'});

                    let FormatMsg = MainController.FormatMsg(inbox.ibx_format_msg.split('.'));


                    let produk = await database.produk.single({produk_id: FormatMsg.productid, produk_kodeProduk: FormatMsg.kode});
                    let akun = await database.profile.single({prl_profile_id: FormatMsg.profileid, prl_isactive: 1});
                    let transaksi = await database.transaksi.allSelect({trx_refid: inbox.ibx_refid})
                    let placement = await database.placement.single({placement_produkid: FormatMsg.productid});

                    placement = JSON.parse(placement.placement_data);

                    // let { }

                    // console.log(placement)
                    // process.exit();


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

                    // let jurnal1 = {
                    //     cf_keterangan: `Pengurangan Nexus dari profile ${akun.prl_profile_id} sebesar ${produk.produk_harga} Nexus seharga ${realHarga} Rupiah`,
                    //     cf_tipe: 'buy',
                    //     cf_kredit: 0,
                    //     cf_debet: realHarga,
                    //     cf_nominal: produk.produk_harga + ' Nexus',
                    //     cf_refid: inbox.ibx_refid,
                    //     cf_internal_acc: '',
                    //     cf_profile_id: akun.prl_profile_id,
                    //     cf_mode: 'min_user'
                    // }

                    // let query = `UPDATE profile SET prl_saldo_nexus = prl_saldo_nexus - ${nexus}, prl_saldo = prl_saldo - ${realHarga} WHERE prl_profile_id = '${akun.prl_profile_id}' AND prl_isactive = 1`;
                    // let updateSaldo = await database.profile.connection.raw(query);

                    // if(updateSaldo.rowCount > 0){
                    //     let penampung = '20200507215106956376'
                    //     let jurnal2 = {
                    //         cf_keterangan: `Penambahan ke account Penampungan Sertifikat dengan id penampung: '${penampung}' degan pembelian Sertifikat seharga ${nexus} Nexus, dengan keuntungan sebesar ${keuntunganUserNexus} Nexus dikonversikan menjadi ${keuntunganUser} Rupiah`,
                    //         cf_tipe: 'buy',
                    //         cf_kredit: keuntunganUser,
                    //         cf_debet: 0,
                    //         cf_nominal: nexus + ' Nexus',
                    //         cf_refid: inbox.ibx_refid,
                    //         cf_internal_acc: penampung,
                    //         cf_profile_id: akun.prl_profile_id,
                    //         cf_mode: 'add_internal'
                    //     }
                    //     query = `UPDATE account SET acc_saldo = acc_saldo + ${keuntunganUser} WHERE acc_noakun = '${penampung}'`
                    //     updateSaldo = await database.account.connection.raw(query);

                    //     if(updateSaldo.rowCount > 0){

                    //         penampung = '20200605171724213363'
                    //         let jurnal3 = {
                    //             cf_keterangan: `Penambahan ke account Penampungan Keuntungan Sertifikat dengan id penampung: '${penampung}' degan pembelian Sertifikat seharga ${nexus} Nexus dengan keuntungan sebesar ${feeNexus} dikonversikan menjadi ${fee} Rupiah`,
                    //             cf_tipe: 'buy',
                    //             cf_kredit: fee,
                    //             cf_debet: 0,
                    //             cf_nominal: nexus + ' Nexus',
                    //             cf_refid: inbox.ibx_refid,
                    //             cf_internal_acc: penampung,
                    //             cf_profile_id: akun.prl_profile_id,
                    //             cf_mode: 'add_profit'
                    //         }
                    //         query = `UPDATE account SET acc_saldo = acc_saldo + ${fee} WHERE acc_noakun = '${penampung}'`
                    //         await database.account.connection.raw(query);
                            // let { nomor, nama, image } = placement;

                            let imgSource = `../../Source/${produk.produk_certificate}`;
                            let imgPath = path.join(__dirname, imgSource);

                            let nameCert = `${MainController.generateID()}_${akun.prl_profile_id}_${produk.produk_certificate}`;
                            let nameExport = `../../Source/${nameCert}`;
                            let exportFile = path.join(__dirname, nameExport);

                            const image = await Jimp.read(imgPath);
                            // let jimpImage = await Jimp.read(imgPath)

                            let { width, height } = image.bitmap;

                            let convertReal = (Math.floor(width / placement.image.resizeTransform.width))

                            let sizeText = Math.floor(placement.nama.fontSize * convertReal);
                            // sizeText += 10;
                            let fontSource = `../../Source/font_storage/cert_${sizeText}.fnt`
                            console.log(fontSource)

                            // console.log(Math.floor(width / placement.image.resizeTransform.width), height / placement.image.resizeTransform.height)
                            // process.exit()

                            let fontPath = path.join(__dirname, fontSource);
                            const font = await Jimp.loadFont(fontPath);
                            // console.log(Jimp);
                            // process.exit()

                            let numberFont = `FONT_SANS_${placement.nomor.fontSize}_BLACK`;
                            numberFont = await Jimp.loadFont(Jimp[numberFont]);
                            // console.log(numberFont)
                            // // console.log(numberFont);
                            // process.exit();

                            var w = image.bitmap.width;
                            var h = image.bitmap.height;

                            let nomorCert = await database.transaksi.connection.raw(`SELECT COUNT(trx_id) as certNumber FROM transaksi WHERE trx_produk_id = '${FormatMsg.produkid}' AND trx_status = 'S'`)

                            nomorCert = nomorCert.rows[0];
                            nomorCert = Number(nomorCert.certnumber);

                            if(nomorCert === 0){
                                nomorCert = `0001`;
                            }else if(nomorCert < 10){
                                nomorCert = `000${nomorCert}`;
                            }else if(nomorCert < 100){
                                nomorCert = `00${nomorCert}`;
                            }else if(nomorCert < 1000){
                                nomorCert = `0${nomorCert}`;
                            }else{
                                nomorCert = `${nomorCert}`;
                            }

                            let nomor = `PREI/SEM/${produk.produk_kodeProduk}/${MainController.romanize(moment().tz("Asia/Jakarta").format("MM"))}/${moment().tz("Asia/Jakarta").format("YYY")}/${nomorCert}`
                            let namaText = akun.prl_nama;

                            var textWidth = Jimp.measureText(font, namaText);
                            var textHeight = Jimp.measureTextHeight(font, namaText);

                            // console.log(textWidth, textHeight)

                            let nomorWidth = Jimp.measureText(font, nomor);
                            let nomorHeight = Jimp.measureTextHeight(font, nomor);

                            if(placement.image.resize){
                                // let imageText = new Jimp(placement.image.resizeTransform.width, placement.image.resizeTransform.height, '#FFFFFF');
                                // let imageText = await Jimp.read(path.join(__dirname, '../../Source/transparent.png'));
                                // await imageText.resize(width, height)
                                // let transparent = await Jimp.read(path.join(__dirname, '../../Source/transparent.png'));
                                // await imageText.composite(transparent, 0,0);
                                // await imageText.rgba(false);
                                // await imageText.background('#FFFFFF');
                                // imageText.resize()

                                // await imageText.print(numberFont, 5, 10, nomor);
                                // await imageText.print(font, 50, 50, namaText);
                                // await imageText.print(font, 10, 10, {
                                //     text: namaText,
                                //     alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                //     alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                                // }, textWidth, textHeight);
                                // // await imageText.print(numberFont, 50, 50, {
                                // //     text: nomor,
                                // //     alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                // //     alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                                // // }, nomorWidth, nomorHeight);
                                // // await imageText.quality(100);
                                // // await imageText.resize(width, height)
                                // // let d = await imageText.writeAsync(path.join(__dirname, '../../Source/testingWazier111.png')); //End
                                // // console.log(d)
                                // // image.blit(imageText, 0,0, [0,0,Number(width), Number(height)]);
                                // image.composite(imageText, 0, 0, {
                                //     mode: Jimp.BLEND_SCREEN,
                                //     shadowOpacity: 1,
                                //     opacityDest: 1
                                // })

                                // let x = w/2-textWidth/2;
                                // let y = h/2-textHeight/2;
                                // let x = width / 2 - textWidth / 2;
                                let x = (placement.nama.offset.left * convertReal) / 2;
                                // let x = (placement.nama.position.left * (width / pla));
                                let y = (placement.nama.offset.top * convertReal);
                                console.log(x, y)
                                // console.log(textWidth, placement.nama.width * convertReal)
                                // console.log(textHeight, placement.nama.height * convertReal)
                                await image.print(font, x, y, {
                                    text: namaText,
                                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                                }, textWidth, textHeight);

                                await image.print(numberFont, 100, 100, {
                                    text: nomor,
                                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                                }, nomorWidth, nomorHeight);
                                await image.writeAsync(exportFile); //End
                            }else{

                            }
                            console.log(placement);
                            process.exit();

                            // let imageText = new Jimp()

                            // let x = w/2-textWidth/2;
                            // let y = h/2-textHeight/2;

                            // if(txt.indexOf(' ') === -1){
                            //     y = y - 70;
                            // }

                            // /*Write Image with Text*/
                            // await image.print(font, x, y, {
                            //     text: txt,
                            //     alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                            //     alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                            // }, textWidth, textHeight);
                            // await image.writeAsync(exportFile); //End

                            // let cashflow = await database.cashflow.insert([jurnal1, jurnal2, jurnal3])

                            // if(cashflow.state){
                            //     let keteranganTrx = `Berhasil membeli Sertifikat ${produk.produk_namaProduk}, sertifikat dapat di download pada halaman Library`;
                            //     let trxData = {
                            //         certificate: nameCert,
                            //         created: MainController.createDate(0),
                            //         download: 0,
                            //         access: 0
                            //     }
                            //     let updateTransaksi = await database.transaksi.updateOne({trx_id: transaksi.trx_id, trx_invoice: transaksi.trx_invoice, trx_refid: inbox.ibx_refid}, {trx_saldo_after: akun.prl_saldo - realHarga, trx_status: 'S', trx_keterangan: keteranganTrx, trx_updated_at: MainController.createDate(0),trx_data: JSON.stringify(trxData)})
                            //     let updateInbox = await database.inbox.updateOne({ibx_refid: inbox.ibx_refid}, {ibx_status: 'S'});
                            //     let Outbox = {
                            //         obx_refid: inbox.ibx_refid,
                            //         obx_id_profile: akun.prl_profile_id,
                            //         obx_interface: 'H',
                            //         obx_tipe: 'BUYCERITICATE',
                            //         obx_status: 'S',
                            //         obx_format_msg: inbox.ibx_format_msg,
                            //         obx_keterangan: `Berhasil input ke Outbox pada ${MainController.createDate(0)}`,
                            //         obx_raw_data: JSON.stringify(transaksi)
                            //     }
                            //     await database.outbox.insertOne(Outbox)
                            //     // await data.produk.updateOne({produk_id: produk.produk_id}, {})
                            //     await database.produk.connection.raw(`UPDATE produk SET produk_buy = produk_buy + 1 WHERE produk_id = '${produk.produk_id}' AND produk_kodeProduk = '${produk.produk_kodeProduk}'`)
                            //     let notifData = {
                            //       data: {
                            //         id: akun.prl_profile_id,
                            //         title: 'Berhasil membeli Sertifikat',
                            //         message: keteranganTrx,
                            //         nama_sender: 'Prexux',
                            //         menu: 'trx',
                            //         tipe: 'default',

                            //         send: 'user'
                            //       }
                            //     }
                            //     await MainController.sendNotif(notifData)

                            //     ibxSucc.push(inbox.ibx_refid);
                            // }else{
                            //     /*Cashflow State*/
                            // }
                    //     }else{
                    //         /*Update Akun 2*/
                    //     }
                    // }else{
                    //     /*Update Akun 1*/
                    // }
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