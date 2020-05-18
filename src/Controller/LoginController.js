
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
                    let { username, password } = body;
                    password = this.createPassword(password);
                    let result = await database.profile.allSelect({prl_username: username, prl_password: password});
                    if(Number(result.length) === 0){
                        response.data = {}
                        response.message = "Failed to Login, check username or password"
                        response.code = 103;
                        response.state = false;
                        throw response;
                    }
                    result = result[result.length - 1];
                    console.log(result)
                    const data = {
                        id: result.prl_id,
                        nama: result.prl_nama,
                        username: result.prl_username,
                        nohp: result.prl_nohp
                    }
                    const Token = this.createToken(data);
                    data.token = Token.token;
                    const update = await database.profile.updateOne({
                        prl_id: data.id
                    }, {
                        prl_token: Token.token
                    });
                    if(update.state){
                        response.data = data;
                        response.message = "Success Login";
                        response.code = 100;
                        response.state = true;
                        console.log(response);
                        return resolve(response)
                    }else{
                        response.data = {};
                        response.message = "Error on Database";
                        response.code = 104;
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
                return resolve(err)
            }
        })
    }

    logout = (body) => {
        return new Promise(async resolve => {
            try{
                // Hapus Token
                
            }catch(err){
                return resolve(err)
            }
        })
    }

    forgotPassword = (body) => {
        return new Promise(async resolve => {
            let response = STRUCTURE;
            let id = body.id;
            console.log(id);
        })
    }
}

module.exports = new LoginController;