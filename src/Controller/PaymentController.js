const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE } = require('@Config/Config');

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
        // ID Profile
        // sama nominal (yang diinputkan)
        return new Promise(async (resolve) => {
            let response = this.structure;
            try{
                let newBody = Object.keys(body);
                let diff = fields.filter((x) => newBody.indexOf(x) === -1)
                if(diff.length === 0){
                    let profile = await database.profile.allSelect({prl_profile_id: String(body.id)});
                    // console.log(profile)
                    if(Number(profile.length) > 0){
                        const codeUnique = async () => {
                            return new Promise(async retData => {
                                let kode = this.generateKodeUnik();
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
                        // Buat Deposit
                        // body.nominal = body.nominal.trim('').trim(',');
                        const deposit = {
                            dep_id: this.generateID(),
                            dep_kode_unik: kode,
                            dep_nominal: Number(body.nominal),
                            dep_id_profile: body.id,
                            dep_total: Number(body.nominal) + Number(kode),
                            dep_expired: this.createDate(),
                            dep_bank_kode: Number(body.id_bank)
                        }
                        let insert = await database.deposit.insertOne(deposit);
                        if(insert.state){
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

    uploadBuktiTransfer = (fields, req) => {
        return new Promise(async (resolve) => {
            let response = this.structure;
            try{
                let body = req;
                let newBody = Object.keys(body);
                let diff = fields.filter((x) => newBody.indexOf(x) === -1)
                // Validasi ID
                let akun = await database.profile.allSelect({prl_profile_id: body.id});
                if(diff.length === 0 && akun.length > 0){
                    akun = akun[0];
                    // Masukkan ke inbox
                    // id
                    // refid
                    // id_profile
                    // interface
                    // tipe
                    // status
                    // format_msg
                    // keterangan
                    // updated_at
                    // raw_data
                    let getDataDeposit = await database.deposit.allSelect({dep_id_profile: body.id, dep_kode_unik: body.kode_unik});
                    getDataDeposit = getDataDeposit[0];
                    let refid = `TOPUPDEPO${this.generateID()}`;
                    let format_msg = `PAY_TOPUP.DEPOSIT.-.${getDataDeposit.dep_nominal}.${body.id}.${refid}`
                    // `PAY_TOPUP.DEPOSIT.-.[nominal].[id_tujuan].[refid]`
                    const insertData = {
                        ibx_refid: refid,
                        ibx_id_profile: body.id,
                        ibx_interface: 'H',
                        ibx_tipe: 'TOPUPDEPOSIT',
                        ibx_status: 'Q',
                        ibx_format_msg: format_msg,
                        ibx_keterangan: `Berhasil input ke inbox pada ${this.createDate(0)}`,
                        ibx_raw_data: JSON.stringify(body)
                    }

                    let insertInbox = await database.inbox.insertOne(insertData);
                    if(insertInbox.state){
                        response.data = {};
                        response.message = `Success create Topup Deposit Trasaction`;
                        response.code = 100;
                        response.state = true;
                        return resolve(response)
                    }else{
                        response.data = {};
                        response.message = `Failed create Topup Deposit Trasaction`;
                        response.code = 103;
                        response.state = true;
                        return resolve(response)
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

    getListBank = () => {
        return new Promise(async resolve => {
            let response = this.structure;
            let data = await database.bank.all();
            response.data = data;
            response.code = 100;
            response.state = true;
            response.message = "Success get list bank"
            resolve(response)
            // console.log(data)
        })
    }

    getListNominal = () => {
        return new Promise(resolve => {
            let response = this.structure;
            let data = [50000, 100000, 150000, 200000, 250000,300000, 350000, 400000, 450000, 500000];
            response.data = data;
            response.code = 100;
            response.state = true;
            response.message = "Success get List nominal";
            resolve(response);
        })
    }


}

module.exports = new PaymentController;