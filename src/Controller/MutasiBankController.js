const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE } = require('@Config/Config');

class MutasiBankController extends MainController {
	structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }

    insertMutasi = (fields, body) => {
    	let response = this.structure;
        return new Promise(async (resolve) => {
            // let newBody = Object.keys(body);
            // let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
            	// if(diff.length === 0){

            		console.log(body);

                    let data = await database.mutasi_bank.insertOne({mutasi_raw: JSON.stringify(body)});
                    console.log(data);

            		response.data = body;
            		response.message = 'Berhasil Insert Mutasi Data';
            		response.code = 100;
            		response.state = true;
                    console.log(response)
            		resolve(response);
            	// }else{
            	// 	response.data = {};
             //        response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
             //        response.code = 102;
             //        response.state = false
             //        resolve(response)
            	// }
            }catch(err){
            	err.code = 503;
            	err.state = false;
            	err.message = JSON.stringify(err);
            	resolve(err);
            }
        });
    }
}

module.exports = new MutasiBankController