export namespace LoginController {
    const { STRUCTURE } = require('@Config/Config');
    const database: any = require('@Model/index');

    const MainController = require('@Controllers/MainController');

    class LoginController {
        public structure: any;
        constructor(){
            this.structure = STRUCTURE;
        }

        loginValidate = (list: Array<string>,body: any) => {
            return new Promise<Object>(async (resolve) => {
                let response = STRUCTURE;
                let newBody: Array<string> = Object.keys(body);
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
}