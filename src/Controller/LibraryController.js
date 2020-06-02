
const { STRUCTURE, URLDATA, URLIMAGE, VERSION } = require('@Config/Config');
const database = require('@Model/index');

let MainController = require('@Controllers/MainController');

class LibraryController extends MainController {
    structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }

    getLibrary = (fields, body) => {
    	let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                	let library = await database.transaksi.connection.raw(`SELECT * FROM transaksi WHERE trx_id_profile = '${body.id}' AND trx_data IS NOT NULL`)
                	if(library.rows.length > 0){
                		library = library.rows;
                		let data = [];
                		for(let idx = 0; idx < library.length; idx++){
                			let produk = await database.produk.single({produk_id: library[idx].trx_produk_id});
                			let trxData = JSON.parse(library[idx].trx_data);
                			let lib = {
                                idlibrary: library.trx_refid,
                				tipeproduk: library[idx].trx_tipe.substr(3).toLowerCase(),
            					nama: produk.produk_namaProduk,
            					pembelian: library[idx].created_at,
            					cover: produk.produk_cover,
            					linkcover: URLIMAGE+produk.produk_cover,
            					downloaded: Number(trxData.download),
            					accessed: Number(trxData.access),
                			}

                			if(library[idx].trx_tipe === 'BUYEBOOK'){
                				lib = {
                					...lib,
                					produk: trxData.ebook,
                					linkproduk: `${URLDATA}api/v${VERSION.split('.')[0]}/Download/Certificate/${trxData.ebook}`
                				}
                				data.push(lib);
                			}else if(library[idx].trx_tipe === 'BUYCERTIFICATE'){
                				lib = {
                					...lib,
                					produk: trxData.certificate,
                					linkproduk: `${URLDATA}api/v${VERSION.split('.')[0]}/Download/Certificate/${trxData.certificate}`
                				}
                				data.push(lib);
                			// }else if(library.trx_tipe === ''){

                			}
                		}

                		response.data = data;
                		response.message = 'Get Library'
                		response.code = 100
                		response.state = true
                		resolve(response)
                	}else{
                		response.data = []
                		response.message = 'No Library Found'
                		response.code = 103
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
            	console.log(err)
            }
        });
    }
}

module.exports = new LibraryController