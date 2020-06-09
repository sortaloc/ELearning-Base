const { STRUCTURE, WHATSAPP } = require('@Config/Config');
const database = require('@Model/index');

let MainController = require('@Controllers/MainController');

const { accountSid, authToken } = WHATSAPP;

const client = require('twilio')(accountSid, authToken);
// const MessagingResponse = require('twilio').twiml.MessagingResponse;

class LoginController extends MainController {
    structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }

    loginValidate = (list,body) => {
        return new Promise(async (resolve) => {
            let response = STRUCTURE;
            let newBody = Object.keys(body);
            let diff = list.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let { input, password, ip, group } = body;

                    if(ip === '::1'){
                        ip = '36.88.30.82';
                    }

                    let tipe;
                    
                    password = this.createPassword(password);
                    let result = await database.profile.connection.raw(
                        `SELECT * 
                        FROM profile
                        WHERE
                        prl_password = '${password}'
                        AND (
                            prl_username LIKE '%${input}%'
                            OR
                            prl_nohp LIKE '%${input}%'
                            OR
                            prl_email LIKE '%${input}%'
                        )
                        AND 
                        prl_group = '${group}'
                        AND
                        prl_isactive = 1
                        `
                        )

                    if(Number(result.rows.length) === 0){
                        response.data = {}
                        response.message = "Failed to Login, check username or password"
                        response.code = 103;
                        response.state = false;
                        throw response;
                    }
                    result = result.rows[result.rows.length - 1];

                    if(newBody.indexOf('tipe') === -1){
                        tipe = 'smartphone'
                        // Validasi jika sudah ada yang login di akun lain pada smartphone
                        let loginCheck = await database.login.allSelect({log_profile_id: result.prl_profile_id, log_type: tipe, log_status: 1, log_ip: ip});
                        if(loginCheck.length > 0){
                            response.data = {}
                            response.message = "User has Logged in on another Smartphone";
                            response.code = 104;
                            response.state = false;
                            throw response;
                        }
                    }else{
                        tipe = body.tipe;
                    }

                    const data = {
                        id: result.prl_profile_id,
                        nama: result.prl_nama,
                        username: result.prl_username,
                        nohp: result.prl_nohp,
                        role: result.prl_role,
                        group: result.prl_group
                    }
                    const Token = this.createToken(data);
                    data.token = Token.token;
                    let geolocation = await this.getLocation(ip);
                    geolocation = geolocation.data;
                    const insertData = {
                        log_profile_id: result.prl_profile_id,
                        log_token: Token.token,
                        log_type: tipe,
                        log_status: 1,
                        log_ip: ip,
                        log_data: JSON.stringify(geolocation),
                        log_lat: geolocation.latitude,
                        log_ing: geolocation.longitude
                    }
                    const insert = await database.login.insertOne(insertData);
                    if(insert.state){
                        response.data = data;
                        response.message = "Success Login";
                        response.code = 100;
                        response.state = true;
                        return resolve(response)
                    }else{
                        response.data = {};
                        response.message = "Error on Database";
                        response.code = 105;
                        response.state = false
                        return resolve(response)
                    }

                }else{
                    response.data = {};
                    response.message = "Input Not Valid";
                    response.code = 102;
                    response.state = false
                    return resolve(response)
                }
            }catch(err){
                console.log(err);
                return resolve(err)
            }
        })
    }

    logout = (body) => {
        let response = this.structure;
        return new Promise(async resolve => {
            try{
                let data = await database.login.allSelect({log_token: body.token, log_status: 1});
                if(data.length > 0){
                    data = data[0];
                    let update = await database.login.updateOne({id: data.id, log_token: data.log_token}, {log_status: 0});
                    if(update.state){
                        response.data = {};
                        response.message = "Success Logout";
                        response.code = 100;
                        response.state = true;
                        return resolve(response)
                    }else{
                        response.data = {};
                        response.message = "Failed to Logout";
                        response.code = 104;
                        response.state = false
                        return resolve(response)
                    }
                }else{
                    response.data = {};
                    response.message = "Failed to Logout, Token was not Valid";
                    response.code = 103;
                    response.state = false
                    throw response
                }
            }catch(err){
                return resolve(err)
            }
        })
    }

    // forgotPassword = (body) => {
    //     return new Promise(async resolve => {
    //         let response = STRUCTURE;
    //         let id = body.id;
    //     })
    // }

    requestForgotPassword = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let response = STRUCTURE;
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            // console.log(body);
            try{
                if(diff.length === 0){
                    let username = await database.profile.connection.raw(`SELECT * FROM profile WHERE LOWER(prl_username) LIKE '%${body.value.toLowerCase()}%' AND prl_isactive = 1`);
                    // console.log('username',username.rows)
                    let email = await database.profile.connection.raw(`SELECT * FROM profile WHERE LOWER(prl_email) LIKE '%${body.value.toLowerCase()}%' AND prl_isactive = 1`);
                    // console.log('email',email.rows)
                    if(Number(body.value.charAt(0)) === 0){
                        body.value = body.value.substr(1);
                    }
                    let nohp = await database.profile.connection.raw(`SELECT * FROM profile WHERE LOWER(prl_nohp) LIKE '%${body.value}%' AND prl_isactive = 1`);
                    // console.log('nohp',nohp.rows)
                    let akun = [];
                    if(username.rows.length > 0){
                        akun = username.rows
                    }
                    if(email.rows.length > 0){
                        akun = email.rows
                    }
                    if(nohp.rows.length > 0){
                        akun = nohp.rows
                    }


                    if(akun.length > 0){
                        akun = akun[0];
                        let OTP = await this.getKodeOTP(akun.prl_nohp);
                        if(!OTP.state){
                            response.data = {};
                            response.message = 'Gagal Mendapatkan Kode OTP, silahkan tunggu beberapa saat lagi';
                            response.code = 104;
                            response.state = false;
                            resolve(response);
                        }

                        OTP = OTP.kode;

                        console.log(OTP);

                        let WA = await database.setting.single({st_kode:'wa_bot'});
                        let data = await client.messages
                        .create({
                            from: `whatsapp:+${WA.st_value}`,
                            body: `Berikut adalah Kode OTP untuk pergantian Password\n${OTP}\nKode OTP akan Expired dalam 30 Menit`,
                            to: `whatsapp:+${akun.prl_nohp}`
                        })

                        console.log(data);

                        response.data = {
                            email: akun.prl_email,
                            username: akun.prl_username,
                            nohp: akun.prl_nohp,
                            otp: OTP,
                            id: akun.prl_profile_id
                        };
                        response.message = 'Berhasil Request Forgot Password';
                        response.code = 100;
                        response.state = true;
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = `Akun tidak Valid, mohon periksa kembali akun yang dikirimakan`;
                        response.code = 103;
                        response.state = false
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
                err.code = 503;
                err.state = false;
                resolve(err);
            }
        });
    }

    validasiOTPForgotPassword = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let response = STRUCTURE;
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let otpData = await database.otp_list.allSelect({otp_kode: body.otp, otp_nohp: body.nohp, otp_status: 0});
                    if(otpData.length > 0){
                        otpData = otpData[0];
                        // await database.otp_list.updateOne({id: otpData.id, otp_nohp: otpData.otp_nohp, otp_kode: otpData.otp_kode}, {otp_status: 5});
                        response.data = body;
                        response.message = `OTP Valid, silahkan melakukan perubahan password baru`;
                        response.code = 100;
                        response.state = true;
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = `OTP tidak Valid`;
                        response.code = 103;
                        response.state = false
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
                err.code = 503;
                err.state = false;
                resolve(err);
            }
        });
    }

    confirmForgotPassword = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let response = STRUCTURE;
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let otp = await database.otp_list.allSelect({otp_kode: body.otp, otp_nohp: body.nohp, otp_status: 0});
                    if(otp.length > 0){
                        otp = otp[0];
                        // Update OTP
                        await database.otp_list.updateOne({id: otp.id, otp_nohp: otp.otp_nohp, otp_kode: otp.otp_kode}, {otp_status: 1});
                        // Update password
                        let password = this.createPassword(body.newPassword);

                        let updatePassword = await database.profile.updateOne({prl_profile_id: body.id, prl_nohp: body.nohp}, {prl_password: password});
                        if(updatePassword.state){
                            response.data = body;
                            response.message = `Sukses merubah password, silahkan login dengan password baru`;
                            response.code = 100;
                            response.state = true
                            resolve(response);
                        }else{
                            response.data = body;
                            response.message = `Gagal merubah Password, silahkan coba beberapa saat lagi`;
                            response.code = 104;
                            response.state = false
                            resolve(response);
                        }
                    }else{
                        response.data = {};
                        response.message = `OTP tidak Valid`;
                        response.code = 103;
                        response.state = false
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
                err.code = 503;
                err.state = false;
                resolve(err);
            }
        });
    }

    testLogout = () => {
        return new Promise(async resolve => {
            let notifData = {
              data: {
                nama_sender: 'Prexux',
                tipe: 'force_logout',

                send: 'global'
              }
            }
            let data = await this.sendNotif(notifData)
            resolve(data);
        })
        // console.log(data);
    }
}

module.exports = new LoginController;