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

            		let retData = [];

            		for(let idx = 0;idx < data.rows.length; idx++){
            			let d = data.rows[0]

            			let cond = Number(d.kredit) !== Number(d.debet) ? false : true
            			let akun = await database.profile.single({prl_profile_id: d.cf_profile_id, prl_isactive: 1});
            			if(cond) ok++;
            			if(!cond) fail++;
            			let newD = {
            				...d,
            				state: cond,
            				nama_profil: akun.prl_nama
            			}

            			retData.push(newD);
            		}

            		let strData = {
            			error: fail,
            			success: ok,
            			list: retData
            		}

            		response.data = strData;
                    response.message = `Success Get Data`;
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

    getSingleCashflow = (fields, body) => {
    	let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                	let cashflow = await database.cashflow.allSelect({cf_refid: body.id});
                    console.log(cashflow);
                	if(cashflow.length > 0){
                		for(let idx = 0; idx < cashflow.length; idx++){
                			let d = cashflow[idx];
                			let akun = await database.profile.single({prl_profile_id: d.cf_profile_id, prl_isactive: 1});

                			d.nama_profil = akun.prl_nama;
                			d.account_state = false;
                			if(d.cf_internal_acc.length > 1){
                				let account = await database.account.single({acc_noakun: d.cf_internal_acc});
                				d.nama_internal_akun = account.acc_nama;
                				d.account_state = true;
                			}
                		}

                		response.data = cashflow;
	                    response.message = `Success Get Data`;
	                    response.code = 100;
	                    response.state = true
	                    resolve(response)
                	}else{
                		response.data = {};
                        response.message = "Cashflow Not Found";
                        response.code = 103;
                        response.state = false
                        return resolve(response)
                	}
                }else{
                	response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    return resolve(response)
                }
            }catch(err){
            	console.log(err);
            }
        });
    }
}

module.exports = new CashflowController 