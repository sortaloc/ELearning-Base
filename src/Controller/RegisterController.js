const { STRUCTURE, WHATSAPP } = require('@Config/Config');
const database = require('@Model/index');
const NIK = require('@Controllers/NikParse');
const { profileSelect, kodeOtpSelect } = require('@Query/QueryModel');

// const { accountSid, authToken } = WHATSAPP;
const accountSid = 'AC7e1fed5ec1e569e4d0f94e7b6ae2275d';
const authToken = '081233cc9cedd9faef9f2894c3ca0400';

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const MainController = require('@Controllers/MainController');

class RegisterController extends MainController {
    structure;
    constructor(){
        super();
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
                    prl_password: this.createPassword(body.password),
                    prl_isactive: 1,
                    prl_profile_id: this.generateID()
                }

                let validate = await database.profile.connection.raw(profileSelect(profileData));

                if(validate.rows.length > 0){
                    response.data = body
                    response.message = 'User Exists'
                    response.state = false;
                    response.code = 104;
                    return resolve(response)
                }else{
                    let result = await database.profile.insertOne(profileData);
                    // console.log(result)
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
                    let res;
                    if(data.tipe === 'otp'){
                        const where = { otp_kode: data.value, otp_status: 0 };
                        res = await database.otp_list.allSelect(where)
                        if(res.length > 0){
                            res = res[0];
                            const retData = {
                                nohp: res.otp_nohp,
                                otp: res.otp_kode
                            }
                            response.code = 100
                            response.message = `OTP Valid`
                            response.state = true;
                            response.data = retData;
                            resolve(response)
                        }else{
                            response.code = 103
                            response.message = `OTP Not Exist`
                            response.state = false;
                            response.data = {};
                            throw response;
                        }
                    }else{
                        let fields = `prl_${data.tipe}`;
                        const where = { [fields] : data.value };
                        res = await database.profile.allSelect(where);
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
                    }

                }else{
                    response.code = 104;
                    response.state = false;
                    response.data = {};
                    response.message = `Data not Valid`;
                    throw response;
                }
            }catch(errRes){
                resolve(errRes);
            }
        })
    }
    registerWhatsapp = async (body, res) => {
        return new Promise(async (resolve) => {
            let getText = body.Body;
            let response = this.structure;

            const twiml = new MessagingResponse();

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
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                    // throw response;
                }else{
                    const getKodeOTP = async () => {
                        const numberPhone = getNumber;
                        const kode = this.generateOTP();
                        // console.log(kode, numberPhone, this.getToday())
                        const query = kodeOtpSelect(kode, numberPhone, this.getToday())
                        let OTPDatabase = await database.otp_list.connection.raw(query)
                        if(OTPDatabase.rows > 0){
                            getKodeOTP()
                        }

                        const otp_listStructure = {
                            otp_nohp: numberPhone,
                            otp_kode: kode,
                            otp_status: 0
                        }
                        const result = await database.otp_list.insertOne(otp_listStructure);
                        if(result){
                            return kode;
                        }else{
                            res.writeHead(500, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                        }
                    }
                    let OTP = await getKodeOTP();
                    const message = `Kode OTP anda adalah : \n${OTP}`
                    twiml.message(message);
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());
                }
            }else{
                console.log('Error');
                res.writeHead(500, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
            }
        })
    }
}

module.exports = new RegisterController;