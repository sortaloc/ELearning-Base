
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
                        WHERE 
                        trx_status = 'S'
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
                	let history = await database.transaksi.allSelect({trx_id_profile: body.id, trx_id: body.trx_id, trx_refid: body.trx_refid});
                	if(history.length > 0){
                        history = history[0];
                        let produk = await database.produk.single({produk_id: history.trx_produk_id})
                        let tipeproduk;

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
                            created: history.trx_created_at,
                            updated: history.trx_updated_at,
                            judul: history.trx_judul
                        }
                        if(produk){
                            tipeproduk  = await database.produk_group.single({id_group: produk.produk_id_group});
                            resData = {
                                ...resData,
                                produkcover: produk.produk_cover,
                                linkcover: URLIMAGE+produk.produk_cover,
                                namaproduk: produk.produk_namaProduk,
                                kodeproduk: produk.produk_kodeProduk,
                            }
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
                        `SELECT * FROM deposit WHERE dep_id_profile = '${body.id}' AND dep_status IN (0, 1) ORDER BY dep_created_at DESC`
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

    allTransaction = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    // let data = await database.transaksi.all();
                    let data = await database.transaksi.connection.raw(
                        `SELECT
                        a.trx_id,
                        a.trx_tipe,
                        a.trx_invoice,
                        a.trx_status,
                        a.trx_judul,
                        a.trx_refid,
                        a.trx_id_profile,
                        a.trx_produk_id,
                        a.trx_created_at,
                        a.trx_updated_at,
                        a.trx_saldo_before,
                        a.trx_saldo_after,
                        a.trx_harga,
                        prf.prl_nama as trx_namauser
                        FROM transaksi a
                        JOIN (SELECT prl_profile_id, prl_nama FROM profile WHERE prl_isactive = 1) prf on prf.prl_profile_id = a.trx_id_profile
                        `
                        )
                    
                    // prd."produk_kodeProduk" as trx_kodeproduk,
                    // prd."produk_namaProduk" as trx_namaproduk
                    
                    // JOIN (SELECT "produk_kodeProduk", "produk_namaProduk", produk_id FROM produk) prd on prd.produk_id = a.trx_produk_id
                    let trxSukses = await database.transaksi.allSelect({trx_status: 'S'});
                    let pending = await database.transaksi.connection.raw(`SELECT COUNT(trx_id) as pending FROM transaksi WHERE trx_status IN ('P', 'W', 'Q')`)
                    let retData = {
                        sukses: trxSukses.length,
                        data: data.rows,
                        proses: pending.rows[0].pending
                    }
                    response.data = retData;
                    response.message = `Success get Transaction`;
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
                err.state = false
                err.code = 505;
                resolve(err);
            }
        });
    }
}

module.exports = new HistoryController