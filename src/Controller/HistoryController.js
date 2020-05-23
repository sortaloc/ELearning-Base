
const { STRUCTURE, URLDATA, URLIMAGE, VERSION } = require('@Config/Config');
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
                		trx_id as id_history, 
                		trx_keterangan as keterangan,
                		FLOOR(trx_harga / 15000) as hargaReal,
                        trx_harga as hargaNexus,
                		trx_tipe as tipetransaksi,
                		trx_id_tipe as tipe,
                		trx_invoice as invoice,
                		trx_refid as refid,
                		trx_status as state,
                        trx_created_at as created,
                        trx_updated_at as updated
                		FROM
                		transaksi
                		WHERE
                		trx_id_profile = '${body.id}'
                        ORDER BY trx_created_at DESC
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
                console.log(err);
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
                	let history = await database.transaksi.allSelect({trx_id_profile: body.id, trx_id: body.trx_id, trx_refid: body.trx_refid,});

                	if(history.length > 0){
                        history = history[0];
                        let produk = await database.produk.single({produk_id: history.trx_produk_id})
                        let tipeproduk = await database.produk_group.single({id_group: produk.produk_id_group})

                        let trxData = JSON.parse(history.trx_data)

                        let resData = {
                            id_history: history.trx_id,
                            keterangan: history.trx_keterangan,
                            hargaReal: Number(history.trx_harga),
                            hargaNexus: Math.floor(Number(history.trx_harga) / 15000),
                            status: history.trx_status,
                            tipetransaksi: history.trx_tipe,
                            profileid: history.trx_id_profile,
                            invoice: history.trx_invoice,
                            refid: history.trx_refid,
                            namaproduk: produk.produk_namaProduk,
                            kodeproduk: produk.produk_kodeProduk,
                            created: history.trx_created_at,
                            updated: history.trx_updated_at,
                            imagecertificate: trxData.certificate,
                            linkcertificate: `${URLDATA}api/v${VERSION.split('.')[0]}/Download/Certificate/${trxData.certificate}`,
                            produkcover: produk.produk_cover,
                            linkcover: URLIMAGE+produk.produk_cover
                        }


                		response.data = resData;
                        response.message = "Success";
                        response.code = 100;
                        response.state = true
                        resolve(response)
                	}else{
                		response.data = {};
                        response.message = "Failed";
                        response.code = 104;
                        response.state = false
                        resolve(response)
                	}
                }else{
                	response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response)
                }
            }catch(err){
                console.log(err);
                err.state = false
                err.code = 505;
            	resolve(err);
            }
        });
    }
}

module.exports = new HistoryController