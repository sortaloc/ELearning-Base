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
                    let Profile = await database.profile.allSelect({prl_profile_id: body.id});
                    if(Number(Profile.length) > 0){
                        const codeUnique = async () => {
                            let kode = this.generateKodeUnik();
                            // let statusOtp = await database.deposit.allSelect({dep_kode_unik: kode, dep_status: 1});
                            let statusOtp = await database.deposit.raw(`
                            SELECT * FROM 
                            public.deposit 
                            WHERE 
                            dep_kode_unik = %${kode}% AND dep_created_at LIKE '${today}%'
                            `)
                            if(statusOtp.length === 0){ //Belum ada Kode OTP maka Lanjut
                                return kode;
                            }else{
                                codeUnique();
                            }
                        }
                        let kode = await codeUnique();
                        // Buat Deposit
                        const deposit = {
                            dep_id: this.generateID(),
                            dep_kode_unik: kode,
                            dep_nominal: Number(body.nominal),
                            dep_id_profile: body.id,
                            dep_total: Number(body.nominal) + Number(kode),
                            dep_expired: this.createDate()
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
                let akun = database.profile.allSelect({prl_profile_id: body.id});
                console.log(akun);
                if(diff.length === 0){
                    // Masukkan ke inbox

                    console.log(body);
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


}

module.exports = new PaymentController;