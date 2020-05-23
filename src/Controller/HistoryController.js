
const { STRUCTURE } = require('@Config/Config');
const database = require('@Model/index');

let MainController = require('@Controllers/MainController');

class HistoryController extends MainController {
    structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }

    getAllHistory = (fields, body) => {
    	let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                	let data = await database.transaksi.connection.raw(
                		`SELECT
                		trx_id, 
                		trx_keterangan,
                		FLOOR(trx_harga / 15000) as trx_harga,
                		trx_tipe,
                		trx_id_tipe,
                		trx_invoice,
                		trx_refid,
                		trx_status,
                        trx_created_at
                		FROM
                		transaksi
                		WHERE
                		trx_id_profile = '${body.id}'
                		`
                		);
                	if(data.rows.length > 0){
                		response.data = data.rows;
                        response.message = "Success";
                        response.code = 100;
                        response.state = true
                        resolve(response)
                	}else{
                		response.data = [];
                        response.message = "No History Available";
                        response.code = 100;
                        response.state = true
                        resolve(response);
                	}
                }else{
                	response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
            	resolve(err)
            }
        });
    }

    getSingleHistory = (fields, body) => {
    	let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let data = await database.transaksi.connection.raw(
                        `SELECT
                        *,
                        FLOOR(trx_harga / 15000) as trx_harga,
                        FROM
                        transaksi
                        WHERE
                        trx_id_profile = '${body.id}'
                        AND
                        trx_refid = '${body.trx_refid}'
                        `
                        );
                    if(data.rows.length > 0){
                        response.data = data.rows[0];
                        response.message = "Success";
                        response.code = 100;
                        response.state = true
                        resolve(response)
                	// let history = await database.transaksi.allSelect({trx_id_profile: body.id, trx_id: body.trx_id, trx_refid: body.trx_refid,});
                	// if(history.length > 0){
                	// 	response.data = history[0];
                 //        response.message = "Success";
                 //        response.code = 100;
                 //        response.state = true
                 //        throw response;
                	}else{
                		response.data = {};
                        response.message = "Failed";
                        response.code = 104;
                        response.state = false
                        throw response;
                	}
                }else{
                	response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
            	resolve(err);
            }
        });
    }
}

module.exports = new HistoryController