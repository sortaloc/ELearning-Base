
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
                		FLOOR(trx_harga) as hargaReal,
                        trx_harga as hargaNexus,
                		trx_tipe as tipetransaksi,
                		trx_id_tipe as tipe,
                		trx_invoice as invoice,
                		trx_refid as refid,
                		trx_status as state,
                        trx_created_at as created,
                        trx_updated_at as updated,
                        trx_judul as judul
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
                        // console.log(history)

                	if(history.length > 0){
                        history = history[0];
                        let produk = await database.produk.single({produk_id: history.trx_produk_id})
                        let tipeproduk = await database.produk_group.single({id_group: produk.produk_id_group})

                        // Check Status
                        // Q
                        // W
                        // S

                        let resData = {
                            id_history: history.trx_id,
                            keterangan: history.trx_keterangan,
                            hargaReal: Number(history.trx_harga),
                            hargaNexus: Math.floor(Number(history.trx_harga) /*/ 15000*/),
                            status: history.trx_status,
                            tipetransaksi: history.trx_tipe,
                            profileid: history.trx_id_profile,
                            invoice: history.trx_invoice,
                            refid: history.trx_refid,
                            namaproduk: produk.produk_namaProduk,
                            kodeproduk: produk.produk_kodeProduk,
                            created: history.trx_created_at,
                            updated: history.trx_updated_at,
                            produkcover: produk.produk_cover,
                            linkcover: URLIMAGE+produk.produk_cover,
                            judul: history.trx_judul
                        }

                        if(history.trx_status === 'Q'){
                        }else if(history.trx_status === 'W'){

                        }else if(history.trx_status === 'S'){
                            // dibagi lagi
                            // Certificate
                            // Ebook
                            let trxData = JSON.parse(history.trx_data)
                            if(history.trx_tipe.toLowerCase().includes('ebook')){
                                resData = {
                                    ...resData,
                                    produk: trxData.ebook,
                                    linkproduk: `${URLDATA}api/v${VERSION.split('.')[0]}/Download/Ebook/${trxData.ebook}`,
                                }
                            }else if(history.trx_tipe.toLowerCase().includes('certificate')){
                                resData = {
                                    ...resData,
                                    produk: trxData.certificate,
                                    linkproduk: `${URLDATA}api/v${VERSION.split('.')[0]}/Download/Certificate/${trxData.certificate}`,
                                }
                            }
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

    

    topupList = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    // let deposit = await database.deposit.allSelect({dep_id_profile: body.id});
                    let deposit = await database.deposit.connection.raw(
                        `SELECT * FROM deposit WHERE dep_id_profile = '${body.id}' AND dep_status IN (0, 1)`
                        )
                    deposit = deposit.rows;
                    let retData = [];
                    for(let idx = 0; idx < deposit.length; idx++){
                        let d = deposit[idx];
                        let data = {
                            iddeposit: d.dep_id,
                            judul: `Topup sebesar ${this.convertToRupiah(d.dep_total)}`,
                            status: d.dep_status,
                            keterangan: this.statusDeposit(d.dep_status),
                            jumlah: d.dep_total,
                            kode_unik: d.dep_kode_unik,
                            nominal: d.dep_nominal,
                            jumlahnominal:this.convertToRupiah(d.dep_nominal), 
                            jumlahrupiah: this.convertToRupiah(d.dep_total)
                        }
                        retData.push(data);
                    }

                    response.data = retData;
                    response.code = 100;
                    response.state = true;
                    response.message = "Get List Deposit"
                    resolve(response);
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

    singleTopup = (fields, body) => {
         let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let deposit = await database.deposit.allSelect({dep_id_profile: body.id, dep_id: body.iddeposit});
                    if(deposit.length > 0){
                        deposit = deposit[0];
                        let bank = await database.bank.single({id: deposit.dep_bank_kode});
                        let d = deposit;
                        let retData = {
                            iddeposit: d.dep_id,
                            judul: `Topup sebesar ${this.convertToRupiah(d.dep_total)}`,
                            status: d.dep_status,
                            keterangan: this.statusDeposit(d.dep_status),
                            jumlah: d.dep_total,
                            kode_unik: d.dep_kode_unik,
                            nominal: d.dep_nominal,
                            jumlahnominal:this.convertToRupiah(d.dep_nominal), 
                            jumlahrupiah: this.convertToRupiah(d.dep_total),
                            bankrekening: bank.bank_rekening,
                            banknama: bank.bank_nama,
                            bankkode: bank.bank_kode,
                            bankimage: bank.bank_image,
                            bankimagelink: URLIMAGE + bank.bank_image,
                            bankid: bank.id
                        }
                        response.data = retData;
                        response.code = 100;
                        response.state = true;
                        response.message = "Get List Deposit"
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = `Deposit tidak ditemukan`;
                        response.code = 103;
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