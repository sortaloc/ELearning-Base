const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE } = require('@Config/Config');

const path = require('path')
// const basename = path.basename(__filename);
const fs = require('fs-extra');
// const fsNorm = require('fs');

class DownloadController extends MainController {
    structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }

    Download = (body) => {
    	return new Promise(async resolve => {
    		let dataToken = await this.decipherToken(body.token);
			let akun = await database.profile.single({prl_profile_id: dataToken.id, prl_isactive: 1});
			try{
				// Ambil data transaksi
				let transaksi = await database.transaksi.connection.raw(
					`SELECT 
					trx_data,
					trx_id,
					trx_refid
					FROM
					transaksi
					WHERE 
					trx_id_profile = '${akun.prl_profile_id}'
					AND
					trx_data LIKE '%${body.image}%'
					`
					)
				if(transaksi.rows.length > 0){
					transaksi = transaksi.rows[0];
					let dataTrx = JSON.parse(transaksi.trx_data)
					dataTrx.download = Number(dataTrx.download) + 1
					dataTrx.access = Number(dataTrx.access) + 1
					await database.transaksi.updateOne({trx_id: transaksi.trx_id, trx_refid: transaksi.trx_refid}, {trx_data: JSON.stringify(dataTrx)});
					let imgSource = `../Source/${body.image}`;
					let imageData = path.join(__dirname, imgSource)

					if(fs.existsSync(imageData)){
						resolve({
							state: true,
							http: 200,
							data: imageData
						})
					}else{
						throw err;
					}
				}else{
					resolve({
	    				state: false,
	    				http: 501,
	    				data: null,
	    				message: 'Transaksi tidak ditemukan'
	    			})
				}
    		}catch(err){
    			console.log(err);
    			resolve({
    				state: false,
    				http: 500,
    				data: null,
    				message: 'hehehe'
    			})
    		}
    	})
    }
}
module.exports = new DownloadController 