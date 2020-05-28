const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE } = require('@Config/Config');

class CashflowController extends MainController {
	structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }

    getAllCashflow(fields, body){
    	let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
            	/*
            	Objective
            	1. List Transaksi Cashflow yang sudah di group
            	2. List Total Transaksi
            	3. List Transaksi Ambigu / Error
            	*/

                if(diff.length === 0){
                	let data = await database.cashflow.connection.raw(
	            		`
	            		SELECT cf_refid, SUM(cf_kredit) as kredit, SUM(cf_debet) as debet, cf_profile_id
	            		FROM 
	            		cashflow
	            		GROUP BY cf_refid, cf_profile_id
	            		`
            		)

            		let ok = 0;
            		let fail = 0;

            		data.rows = data.rows.map(d => {
            			let cond = Number(d.kredit) !== Number(d.debet) ? false : true
            			if(cond) ok++;
            			if(!cond) fail++;
            			return {
            				...d,
            				state: cond
            			}
            		})

            		let strData = {
            			error: fail,
            			success: ok,
            			list: data.rows
            		}

            		response.data = strData;
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 100;
                    response.state = true
                    resolve(response)

                }else{
                	response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response)
                }
            }catch(err){
            	console.log(err);
            }
        });
    }
}

module.exports = new CashflowController 