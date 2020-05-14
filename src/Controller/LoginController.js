
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
            if(diff.length === 0){
                let { username, password } = body;

                password = MainController.createPassword(password);
                console.log(password);
                let result = await database.profile.allSelect({prl_username: username, prl_password: password});
                console.log(result);
                // database.profile
                // True
                // Decrypt Password

                // Enkripsi lagi jadi sama kaya password
                // 
            }else{
                response.data = {};
                response.message = "Input Not Valid";
                response.code = 102;
                response.state = false
                resolve(response);
            }
        })
    }
}

module.exports = new LoginController;