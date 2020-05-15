const { STRUCTURE, WHATSAPP } = require('@Config/Config');
const database = require('@Model/index');
const NIK = require('@Controllers/NikParse');
const { profileSelect } = require('@Query/QueryModel');

const { accountSid, authToken } = WHATSAPP;

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twiml = new MessagingResponse();

const MainController = require('@Controllers/MainController');

class RegisterController {
    structure;
    constructor(){
        this.structure = STRUCTURE;
    }

    registerUser = async (fields, body) => {
        return new Promise(async (resolve) => {
            let response = this.structure;
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            if(diff.length === 0){
                const profileData = {
                    prl_nik: body.nik,
                    prl_nama: body.nama,
                    prl_group: 'ekoji',
                    prl_nohp: body.nohp,
                    prl_username: body.username,
                    prl_password: MainController.createPassword(body.password),
                    prl_isactive: 1,
                    prl_profile_id: MainController.generateID()
                }
                // let validate = await database.profile.connection.raw(`
                // SELECT * from 
                // profile 
                // WHERE
                // prl_nik LIKE '%${profileData.prl_nik}%'
                // OR
                // prl_nama LIKE '%${profileData.prl_nama}%'
                // OR
                // prl_nohp LIKE '%${profileData.prl_nohp}%'
                // OR
                // prl_username LIKE '%${profileData.prl_username}%'
                // `)

                let validate = await database.profile.connection.raw(profileSelect());
                if(validate.rows.length > 0){
                    response.data = body
                    response.message = 'User Exists'
                    response.state = false;
                    response.code = 104;
                    return resolve(response)
                }else{
                    let result = await database.profile.insertOne(profileData);
                    console.log(result)
                    if(result.state){
                        response.data = {
                            username: profileData.prl_username,
                            nama: profileData.prl_nama
                        }

                        // Update Kode OTP Menjadi 1
                        response.message = `Success to Create user ${profileData.prl_nama}`
                        response.state = true;
                        response.code = 100;
                        resolve(response)
                    }else{
                        response.data = {}
                        response.message = 'Failed to Create Profile'
                        response.state = false;
                        response.code = 103;
                        resolve(response)
                    }
                }
            }else{
                response.data = {};
                response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                response.code = 102;
                response.state = false
                resolve(response);
            }
        })
    }

    validasi = (tipe, data) => {
        return new Promise(async (resolve) => {
            let response = this.structure;
            try{
                if(data.tipe === 'nik'){
                    let nik = NIK(data.value);
                    let newNik = new Map(Object.entries(nik));
                    if(newNik.has('error')){
                        response.code = 103
                        response.message = `${data.value} tidak Valid`
                        response.data = {};
                        response.state = false;
                        throw response;
                    }
                }
                if(data.tipe === 'nohp'){
                    if(data.value.substring(0,2) !== '62'){
                        response.code = 104;
                        response.message = `${data.value}, nomor tidak valid, harus menggunakan 62 tanpa +, silahkan cek kembali`
                        response.data = {}
                        response.state = false;
                        throw response;
                    }
                }
                let status = tipe.includes(data.tipe)
                if(status){
                    let fields = `prl_${data.tipe}`;
                    const where = { [fields] : data.value };
                    let res = await database.profile.allSelect(where);
                    if(res.length === 0){
                        response.state = true;
                        response.message = `${data.value} are valid to register`;
                        response.code = 100;
                        response.data = data;
                        resolve(response);
                    }else{
                        response.code = 102
                        response.message = `${data.value} was exist`
                        response.state = false;
                        response.data = {};
                        throw response;
                    }
                }else{
                    response.code = 104;
                    response.state = false;
                    response.data = {};
                    response.message = `Data not Valid`;
                }
            }catch(errRes){
                resolve(errRes);
            }
        })
    }
    registerWhatsapp = async (body) => {
        return new Promise(async (resolve) => {
            let getText = body.Body;
            let response = this.structure;
            try{
                getText = getText.trim().toLowerCase();
                if(getText.indexOf('reg') > -1 || getText.indexOf('xus') > -1){ //Jika ada
                    let getNumber = (number = body.From) => {
                        number = number.split(':');
                        number = number[number.length-1];
                        number = number.replace(/\+/gi, '');
                        return number;
                    };

                    getNumber = getNumber(body.From);
                    const valNomer = await database.profile.allSelect({prl_nohp: getNumber, prl_isactive: 1})

                    if(valNomer.length > 0){
                        response.code = 101;
                        response.state = false;
                        response.data = {};
                        response.message = `Nomor : ${getNumber} telah terdaftar di database`;
                        twiml.message('Nomor anda telah terdaftar pada aplikasi');
                        throw response;
                    }else{
                        const getKodeOTP = async () => {
                            let number = getNumber;
                            const kode = MainController.generateOTP();
                            let OTPDatabase = await database.otp_list.connection.raw(`
                            SELECT * FROM 
                            public.otp_list 
                            WHERE 
                            otp_kode LIKE '%${kode}%' AND otp_nohp LIKE '%${number}%' AND otp_created_at LIKE '${MainController.getToday()}%' AND otp_status = 0`)
                            if(OTPDatabase.rows > 0){
                                getKodeOTP()
                            }

                            const otp_listStructure = {
                                otp_nohp: number,
                                otp_kode: kode,
                                otp_status: 0
                            }
                            const result = await database.otp_list.insertOne(otp_listStructure);
                            if(result){
                                return kode;
                            }else{
                                response.code = 103;
                                response.data = {};
                                response.state = false;
                                response.message = 'Failed to insert OTP';
                                twiml.message('Gagal mendapatkan OTP, silahkan coba beberapa saat lagi');
                                throw response;
                            }
                        }
                        let OTP = await getKodeOTP();
                        const message = `Kode OTP anda adalah : ${OTP}`
                        twiml.message(message);
                        response.code = 100;
                        response.data = {otp: OTP, nohp: getNumber};
                        response.state = true;
                        response.message = message;
                        resolve(response)
                    }
                }else{
                    response.code = 102;
                    response.data = {};
                    response.state = false;
                    response.message = 'Command Not Found';
                    twiml.message('Command tidak ditemukan, Masukkan Reg Nexus untuk memulai');
                    throw response;
                }
            }catch(resultError){
                console.log(resultError)
                resolve(resultError)
            }
        })



    
    }
}

module.exports = new RegisterController;