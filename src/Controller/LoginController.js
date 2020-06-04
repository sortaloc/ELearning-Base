
const { STRUCTURE } = require('@Config/Config');
const database = require('@Model/index');

let MainController = require('@Controllers/MainController');

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
                        prl_group = '${group}',
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
                        nohp: result.prl_nohp
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

    forgotPassword = (body) => {
        return new Promise(async resolve => {
            let response = STRUCTURE;
            let id = body.id;
        })
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