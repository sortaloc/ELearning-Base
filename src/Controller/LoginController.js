
const { STRUCTURE } = require('@Config/Config');
const database = require('@Model/index');

const MainController = require('@Controllers/MainController');

class LoginController {
    structure;
    constructor(){
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
                    password = MainController.createPassword(password);
                    let result = await database.profile.allSelect({prl_username: username, prl_password: password});
                    if(Number(result.length) === 0){
                        response.data = {}
                        response.message = "Data Not Found"
                        response.code = 103;
                        response.state = false;
                        throw response;
                    }
                    result = result[result.length - 1];
                    const data = {
                        id: result.prl_id,
                        nama: result.prl_nama,
                        username: result.prl_username,
                        nohp: result.prl_nohp
                    }
                    const Token = MainController.createToken(data);
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
}

module.exports = new LoginController;