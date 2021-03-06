
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
                    // console.log(library.rows.length)
                	// if(library.rows.length > 0){
                		library = library.rows;
                		let data = []; 
                        let libData = await Promise.all(library.map(async libs => {
                            let produk = await database.produk.single({produk_id: libs.trx_produk_id})
                            if(produk){
                                let pemateri = await database.profile.single({prl_profile_id: produk.produk_pemateri_id})
                                let trxData = JSON.parse(libs.trx_data);
                                let lib = {
                                    idlibrary: libs.trx_refid,
                                    tipeproduk: libs.trx_tipe.substr(3).toLowerCase(),
                                    nama: produk.produk_namaProduk,
                                    pembelian: libs.trx_created_at,
                                    cover: produk.produk_cover,
                                    linkcover: URLIMAGE+produk.produk_cover,
                                    downloaded: Number(trxData.download),
                                    accessed: Number(trxData.access),
                                    kodeproduk: produk.produk_kodeProduk,
                                    produkid: produk.produk_id,
                                    state: true,
                                    namapemateri: pemateri.prl_nama,
                                    usernamepemateri: pemateri.prl_username,
                                    photopemateri: pemateri.prl_photo,
                                    photopematerilink: URLIMAGE+pemateri.prl_photo
                                }

                                if(libs.trx_tipe === 'BUYEBOOK'){
                                    lib = {
                                        ...lib,
                                        produk: trxData.ebook,
                                        linkproduk: `${URLDATA}api/v${VERSION.split('.')[0]}/Download/Ebook/${trxData.ebook}`
                                    }
                                    data.push(lib);
                                }else if(libs.trx_tipe === 'BUYCERTIFICATE'){
                                    lib = {
                                        ...lib,
                                        produk: trxData.certificate,
                                        linkproduk: `${URLDATA}api/v${VERSION.split('.')[0]}/Download/Certificate/${trxData.certificate}`
                                    }
                                    // console.log(lib)
                                    data.push(lib);
                                }else if(libs.trx_tipe === 'BUYPRESENTASI'){
                                    lib = {
                                        ...lib,
                                        produk: trxData.presentasi,
                                        linkproduk: `${URLDATA}api/v${VERSION.split('.')[0]}/Download/Presentasi/${trxData.presentasi}`
                                    }
                                    data.push(lib);
                                }else if(libs.trx_tipe === 'BUYPROFISIENSI'){
                                    // console.log(trxData)
                                    lib = {
                                        ...lib,
                                        startclass: produk.produk_start,
                                        endclass: produk.produk_enc,
                                        username: trxData.username,
                                        password: trxData.password,
                                        created: trxData.created
                                    }
                                    data.push(lib);
                                }else{
                                    lib.state = false;
                                    data.push(lib);
                                }
                                // data.push(lib)
                                return lib;
                            }
                        }))


                		response.data = data;
                		response.message = data.length > 0 ? `Success Get Data Library, length : ${data.length}` : 'Data Library is null'
                		response.code = 100
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
            	console.log(err)
                err.state = false;
                err.code = 503;
                resolve(err);
            }
        });
    }
}

module.exports = new LibraryController