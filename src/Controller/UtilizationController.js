const { STRUCTURE, URLDATA, URLIMAGE, VERSION } = require('@Config/Config');
const database = require('@Model/index');

let MainController = require('@Controllers/MainController');

class UtilizationController extends MainController {
    structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }

    getWA = () => {
    	return new Promise(async resolve => {
	    	let response = this.structure;
	    	let setting = await database.setting.single({st_kode: 'wa_bot'});
	        let wa = setting.st_value;

	        response.state = true;
	        response.code = 100;
	        response.message = 'Success get Number WA';
	        response.data = {
	        	value: wa
	        }

	        resolve(response);
    	})
    }

    getCS = () => {
    	return new Promise(async resolve => {
	    	let response = this.structure;
	    	let setting = await database.setting.single({st_kode: 'cs_number'});
	        let csnumber = setting.st_value;

	        response.state = true;
	        response.code = 100;
	        response.message = 'Success get Number CS';
	        response.data = {
	        	value: csnumber
	        }

	        resolve(response);
    	})
    }
}

module.exports = new UtilizationController;