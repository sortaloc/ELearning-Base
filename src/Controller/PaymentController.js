const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE, URLIMAGE } = require('@Config/Config');

const path = require('path')
const basename = path.basename(__filename);
const fs = require('fs-extra');
const fsNorm = require('fs');

const busboy = require('connect-busboy');


const uploadPath = path.join(__dirname, '../Source/');
fs.ensureDir(uploadPath);

class PaymentController extends MainController {
    structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }

    createDeposit(fields, body){
        return new Promise(async (resolve) => {
            let response = this.structure;
            try{
                let newBody = Object.keys(body);
                let diff = fields.filter((x) => newBody.indexOf(x) === -1)
                if(diff.length === 0){
                    let profile = await database.profile.allSelect({prl_profile_id: String(body.id), prl_isactive: 1});
                    if(Number(profile.length) > 0){

                        profile = profile[0];

                        const codeUnique = async () => {
                            return new Promise(async retData => {
                                // let kode = this.generateKodeUnik();
                                let kode = this.getRandomInt(1, 500);
                                // let statusOtp = await database.deposit.allSelect({dep_kode_unik: kode, dep_status: 1});
                                let statusOtp = await database.deposit.connection.raw(`
                                SELECT * FROM
                                deposit
                                WHERE
                                dep_kode_unik = ${kode} AND dep_created_at BETWEEN '${this.createDate(-24)}' AND '${this.createDate(0)}' AND dep_status = 0
                                `)
                                if(statusOtp.rows.length === 0){ //Belum ada Kode OTP maka Lanjut
                                    retData(kode);
                                }else{
                                    codeUnique();
                                }

                            })
                        }
                        let kode = await codeUnique();

                        // let group = await database.produk_group.single({id_group: produk.produk_id_group})

                        let trxID = this.generateID();
                        let trxINV = this.createInvoice('TOPUP');
                        let refid = `TOPUPDEPO${this.generateID()}`;

                        const deposit = {
                            dep_id: this.generateID(),
                            dep_kode_unik: kode,
                            dep_nominal: Number(body.nominal),
                            dep_id_profile: body.id,
                            dep_total: Number(body.nominal) + Number(kode),
                            dep_expired: this.createDate(),
                            dep_bank_kode: Number(body.id_bank),
                            dep_refid: refid
                        }
                        let insert = await database.deposit.insertOne(deposit);

                        let transaksi = {
                            trx_id: trxID,
                            trx_keterangan: 'Transaksi sedang dalam proses',
                            trx_tipe: 'TOPUPDEPOSIT',
                            trx_id_tipe: 'TOPUP',
                            trx_harga: deposit.dep_nominal,
                            trx_fee: deposit.dep_kode_unik,
                            trx_total_harga: deposit.dep_total,
                            trx_saldo_before: Number(profile.prl_saldo_nexus),
                            trx_saldo_after: Number(profile.prl_saldo_nexus) + Number(deposit.dep_nominal),
                            trx_status: 'Q',
                            trx_id_profile: profile.prl_profile_id,
                            trx_code_voucher: '',
                            trx_invoice: trxINV,
                            trx_refid: refid,
                            trx_judul: `Topup ${deposit.dep_nominal}`
                        }

                        let insertTrx = await database.transaksi.insertOne(transaksi);

                        if(insert.state && insertTrx.state){
                            response.data = {
                                id_deposit: deposit.dep_id,
                                total: deposit.dep_total,
                                kode_unk: deposit.dep_kode_unik,
                                expired: deposit.dep_expired,
                            };
                            response.message = `Success Create Deposit`;
                            response.code = 100;
                            response.state = true;
                            resolve(response);
                        }else{
                            // Gagal Insert
                            response.data = {};
                            response.message = `Failed to Insert to database`;
                            response.code = 103;
                            response.state = false;
                            resolve(response);
                        }
                    }else{
                        response.data = {};
                        response.message = `Account not Found`;
                        response.code = 104;
                        response.state = false;
                        resolve(response);
                    }
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response);
                }
            }catch(err){
                console.log(err)

                response.data = {};
                response.message = `Something Error`;
                response.code = 105;
                response.state = false
                resolve(response);
            }
        })
    }

    // uploadBuktiTransfer = (fields, req) => {
    //     return new Promise(async (resolve) => {
    //         let response = this.structure;
    //         try{
    //             let body = req;
    //             let newBody = Object.keys(body);
    //             let diff = fields.filter((x) => newBody.indexOf(x) === -1)
    //             // Validasi ID
    //             let akun = await database.profile.allSelect({prl_profile_id: body.id, prl_isactive: 1});
    //             if(diff.length === 0 && akun.length > 0){
    //                 // Update Deposit menjadi 1 = Ready di cek dari dashboard
    //                 akun = akun[0];
    //                 let getDataDeposit = await database.deposit.allSelect({dep_id_profile: body.id, dep_kode_unik: body.kode_unik});
    //                 if(getDataDeposit.length > 0){
    //                     getDataDeposit = getDataDeposit[0];
    //                     let refid = `TOPUPDEPO${this.generateID()}`;
    //                     let upd = {
    //                         where: {
    //                             dep_id: getDataDeposit.dep_id,
    //                             dep_kode_unik: getDataDeposit.dep_kode_unik,
    //                             dep_total: getDataDeposit.dep_total,
    //                             dep_id_profile: body.id
    //                         },
    //                         update: {
    //                             dep_status: 1,
    //                             dep_refid: refid,
    //                             dep_image: body.file
    //                         }
    //                     }
    //                     let updateDeposit = await database.deposit.updateOne(upd.where, upd.update);

    //                     if(updateDeposit.state){
    //                         response.data = {};
    //                         response.message = `Success create Topup Deposit Trasaction, wait for admin to verify`;
    //                         response.code = 100;
    //                         response.state = true;
    //                         return resolve(response)
    //                     }else{
    //                         response.data = {};
    //                         response.message = `Failed create Topup Deposit Trasaction`;
    //                         response.code = 103;
    //                         response.state = true;
    //                         return resolve(response)
    //                     }
    //                 }
                    
    //             }else{
    //                 response.data = {};
    //                 response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
    //                 response.code = 102;
    //                 response.state = false
    //                 resolve(response);
    //             }
    //         }catch(err){
    //             console.log(err)
    //             response.data = {};
    //             response.message = `Something Error`;
    //             response.code = 105;
    //             response.state = false
    //             resolve(response);
    //         }
    //     })
    
    // }

    getListBank = () => {
        return new Promise(async resolve => {
            let response = this.structure;
            let data = await database.bank.connection.raw(
                `SELECT "id", bank_id, bank_kode, bank_nama, bank_rekening, bank_created_at, bank_updated_at, bank_image, bank_name, CONCAT('${URLIMAGE}', bank_image)as bank_link from bank`
                );
            response.data = data.rows;
            response.code = 100;
            response.state = true;
            response.message = "Success get list bank"
            resolve(response)
        })
    }

    getListNominal = () => {
        return new Promise(async resolve => {
            let response = this.structure;

            let topupData = await database.setting.allSelect({st_kode: 'topup_nominal'});
            topupData = topupData[0];
            topupData = JSON.parse(topupData.st_value);
            // let data = [5000, 10000, 20000, 50000, 100000, 150000, 200000, 250000,300000, 350000, 400000, 450000, 500000];
            let data = topupData;
            let nexus = 1;
            let newData = [];
            // let nilaiNexus = [];
            for(let idx = 0; idx < data.length; idx++){
                newData[idx] = {
                    nexus: Math.floor(data[idx] / nexus),
                    rupiah: data[idx]
                }
            }
            response.data = newData;
            response.code = 100;
            response.state = true;
            response.message = "Success get List nominal";
            resolve(response);
        })
    }

    getAllDeposit = (body) => {
        let newBody = Object.keys(body);
        // let newBody = new Map(Object.entries(body));

        let limit = 50;
        let page = 1;
        if(newBody.indexOf('limit') !== -1){
            limit = body.limit
        }
        if(newBody.indexOf('page') !== -1){
            let page = body.page;
        }
        
        // console.log(limit, page, newBody)
        // let diff = ['limit', 'page', 'next', 'before'].filter((x) => newBody.indexOf(x) === -1)
        return new Promise(async (resolve) => {
            let response = this.structure;
            try{
                let deposit = await database.deposit.connection.raw(`
                SELECT deposit.dep_id as iddeposit, 
                deposit.dep_admin_id as adminid, 
                deposit.dep_bank_kode as kodebank, 
                deposit.dep_expired as expired, 
                deposit.dep_id_profile as profileid, 
                deposit.dep_image as buktitransfer, 
                deposit.dep_kode_unik as kodeunik, 
                deposit.dep_nominal as nominal, 
                deposit.dep_status as status, 
                deposit.dep_total as totalbayar, 
                deposit.dep_updated_at, 
                profile.prl_nama as namaakun,
                bank.bank_nama as namarekening,
                bank.bank_name as bank
                from deposit
                JOIN profile ON profile.prl_profile_id = deposit.dep_id_profile
                JOIN bank ON bank."id" = deposit.dep_bank_kode
                ORDER BY expired DESC
                `);
                response.data = deposit.rows;
                response.code = 100;
                response.state = true;
                response.message = "Success get List Deposit";
                resolve(response);
            }catch(err){
                console.log(err);

                response.data = [];
                response.code = 102;
                response.state = false;
                response.message = "Something Failed";
                resolve(response);
            }
        })
    }

    detailDeposit = (fields, body) => {
        // console.log(fields, body);
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let deposit = await database.deposit.connection.raw(`
                    SELECT deposit.dep_id as iddeposit, 
                    deposit.dep_admin_id as adminid, 
                    deposit.dep_bank_kode as kodebank, 
                    deposit.dep_expired as expired, 
                    deposit.dep_id_profile as profileid, 
                    deposit.dep_image as buktitransfer, 
                    deposit.dep_kode_unik as kodeunik, 
                    deposit.dep_nominal as nominal, 
                    deposit.dep_status as status, 
                    deposit.dep_total as totalbayar, 
                    deposit.dep_updated_at, 
                    profile.prl_nama as namaakun,
                    bank.bank_nama as namarekening
                    from deposit
                    JOIN profile ON profile.prl_profile_id = deposit.dep_id_profile
                    JOIN bank ON bank."id" = deposit.dep_bank_kode
                    WHERE deposit.dep_id = '${body.id}'
                    `);
                    if(deposit.rows.length > 0){
                        response.data = deposit.rows[0];
                        response.code = 100;
                        response.state = true;
                        response.message = "Success get Deposit";
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = `Failed get Deposit`;
                        response.code = 103;
                        response.state = false
                        throw response
                    }
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                resolve(err);
            }
        });
    }

    // processDeposit = (fields, body) => {
    //     let response = this.structure;
    //     return new Promise(async (resolve) => {
    //         let newBody = Object.keys(body);
    //         let diff = fields.filter((x) => newBody.indexOf(x) === -1)
    //         try{
    //             if(diff.length === 0){
    //                 // get Table Akun
    //                 let adminProfile = await database.profile.single({prl_profile_id: body.adminid, prl_isactive: 1});
    //                 let deposit = await database.deposit.single({dep_id: body.id});
    //                 let akun = await database.profile.single({prl_profile_id: deposit.dep_id_profile, prl_isactive: 1});

    //                 // Deteksi dulu statusnya
    //                 // let refid = `TOPUPDEPO${this.generateID()}`;

    //                 let update = {
    //                     where: {
    //                         dep_id: body.id
    //                     },
    //                     update: {
    //                         dep_status: body.status,
    //                         dep_admin_id: body.adminid,
    //                         dep_updated_at: this.createDate(0),
    //                     }
    //                 }

    //                 if(Number(body.status) === 1){
    //                     update.update.dep_status = 2;
    //                 }else if(Number(body.status) === 2){
    //                     update.update.dep_status = 6;
    //                 }

    //                 let updateDeposit = await database.deposit.updateOne(update.where, update.update);

    //                 if(updateDeposit.state){
    //                     if(Number(body.status) === 1){
    //                         let format_msg = `PAY_TOPUP.DEPOSIT.${deposit.dep_nominal}.${deposit.dep_total}.${body.id}.${deposit.dep_refid}.${adminProfile.prl_profile_id}`;
    //                         // // `PAY_TOPUP.DEPOSIT.-.[nominal].[id_tujuan].[refid].[admin_profile]`
    //                         const insertData = {
    //                             ibx_refid: deposit.dep_refid,
    //                             ibx_id_profile: akun.prl_profile_id,
    //                             ibx_interface: 'H',
    //                             ibx_tipe: 'TOPUPDEPOSIT',
    //                             ibx_status: 'Q',
    //                             ibx_format_msg: format_msg,
    //                             ibx_keterangan: `Berhasil input ke inbox pada ${this.createDate(0)}`,
    //                             ibx_raw_data: JSON.stringify(body)
    //                         }

    //                         let insertInbox = await database.inbox.insertOne(insertData);
    //                         if(insertInbox.state){
    //                             response.data = body;
    //                             response.code = 100;
    //                             response.state = true;
    //                             response.message = "Success Update Deposit";
    //                             resolve(response);
    //                         }else{
    //                             response.data = body;
    //                             response.code = 103;
    //                             response.state = false;
    //                             response.message = "Failed Update Deposit";
    //                             resolve(response);
    //                         }
    //                     }
    //                 }else{
    //                     response.data = {};
    //                     response.message = `Failed to Update Deposit, please try again soon`;
    //                     response.code = 104;
    //                     response.state = false
    //                     throw response;    
    //                 }
    //             }else{
    //                 response.data = {};
    //                 response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
    //                 response.code = 102;
    //                 response.state = false
    //                 throw response;
    //             }
    //         }catch(err){
    //             console.log(err);
    //             resolve(err);
    //         }
    //     });
    // }

    buyProduct = (fields, body, type) => {
        return new Promise(async (resolve) => {
            var response = this.structure;
            var newBody = Object.keys(body);
            var diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    var akun = await database.profile.allSelect({prl_profile_id: body.id, prl_password: this.createPassword(body.password), prl_isactive: 1});
                    if(akun.length > 0){
                        akun = akun[0];
                        var produk = await database.produk.allSelect({produk_id: body.idproduk, produk_kodeProduk: body.kodeproduk});
                        if(produk.length > 0){
                            produk = produk[0];
                            let group = await database.produk_group.single({id_group: produk.produk_id_group})
                            // akun.prl_saldo_nexus = 1000;
                            if(Number(akun.prl_saldo_nexus) - Number(produk.produk_harga) >= 0){
                                let refid = `${type}${this.generateID()}`;
                                let format_msg = `PAY_BUY.${produk.produk_kodeProduk}.${produk.produk_id}.${produk.produk_harga}.${akun.prl_profile_id}.${refid}`;
                                // `PAY_TOPUP.DEPOSIT.-.[nominal].[id_tujuan].[refid]`
                                const insertData = {
                                    ibx_refid: refid,
                                    ibx_id_profile: akun.prl_profile_id,
                                    ibx_interface: 'H',
                                    ibx_tipe: type,
                                    ibx_status: 'Q',
                                    ibx_format_msg: format_msg,
                                    ibx_keterangan: `Berhasil input ke inbox pada ${this.createDate(0)}`,
                                    ibx_raw_data: JSON.stringify(body)
                                }

                                let harga = Number(produk.produk_harga) /** 15000*/;

                                let trxID = this.generateID();
                                let trxINV = this.createInvoice('BUY');
                                let transaksi = {
                                    trx_id: trxID,
                                    trx_keterangan: 'Transaksi sedang dalam proses',
                                    trx_tipe: type,
                                    trx_id_tipe: 'BUY',
                                    trx_harga: harga,
                                    trx_fee: 0,
                                    trx_total_harga: harga,
                                    trx_saldo_before: Number(akun.prl_saldo),
                                    trx_saldo_after: 0,
                                    trx_status: 'Q',
                                    trx_id_profile: akun.prl_profile_id,
                                    trx_code_voucher: '',
                                    trx_invoice: trxINV,
                                    trx_refid: refid,
                                    trx_produk_id: produk.produk_id,
                                    trx_judul: `Pembelian ${group.group_nama}`
                                }

                                let insertTrx = await database.transaksi.insert(transaksi);
                                let insertInbox = await database.inbox.insertOne(insertData);

                                if(insertInbox.state && insertInbox.state){
                                    response.data = body;
                                    response.message = `Transaksi Berhasil, silahkan tunggu notifikasi`;
                                    response.code = 107;
                                    response.state = true
                                    resolve(response)
                                }else{
                                    response.data = body;
                                    response.message = `Transaksi Gagal!, silahkan dicoba kembali`;
                                    response.code = 106;
                                    response.state = false
                                    resolve(response)
                                }

                            }else{
                                response.data = body;
                                response.message = `Saldo tidak cukup`;
                                response.code = 105;
                                response.state = false
                                resolve(response)
                            }
                        }else{
                            response.data = body;
                            response.message = `Product Not Valid`;
                            response.code = 104;
                            response.state = false
                            resolve(response)
                        }
                    }else{
                        response.data = body;
                        response.message = `Account Not Valid`;
                        response.code = 103;
                        response.state = false
                        resolve(response)
                    }
                }else{
                    response.data = body;
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response)
                }
            }catch(err){
                console.log(err)
                response.data = body;
                response.message = `Something Error`;
                response.code = 500;
                response.state = false
                resolve(response)
            }
        })
    }

    listRequestTopup = (fields, body) => {
        var response = this.structure;
        return new Promise(async resolve => {
            var newBody = Object.keys(body);
            var diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let data = await database.deposit.allSelect({dep_id_profile: body.id})
                    let akun = await database.profile.single({prl_profile_id: body.id, prl_isactive: 1})
                    data = data.map( async (d) => {
                        return {
                            namaakun: akun.prl_nama,
                            deposit: d.dep_total,
                            status: d.dep_status,
                            refid: d.dep_refid,
                        }
                    })
                    response.data = data;
                    response.code = 100;
                    response.state = true;
                    response.message = 'Success';
                    resolve(response)
                }else{
                    response.data = body;
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response)
                }
            }catch(err){
                console.log(err)
                response.data = body;
                response.message = `Something Error`;
                response.code = 500;
                response.state = false
                resolve(response)
            }
        });
    }

    depositNotif = (fields, body) => {
        var response = this.structure;
        return new Promise(async resolve => {
            var newBody = Object.keys(body);
            var diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let data = await database.deposit.connection.raw('SELECT count(dep_status) as deposit_notif from deposit WHERE dep_status = 1');
                    data = data.rows[0];
                    response.data = data;
                    response.message = `Success Get Notif Data`;
                    response.code = 100;
                    response.state = true
                    resolve(response)
                }else{
                    response.data = body;
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response)
                }
            }catch(err){
                console.log(err)
                response.data = body;
                response.message = `Something Error`;
                response.code = 500;
                response.state = false
                resolve(response)
            }
        });
    }


}

module.exports = new PaymentController;