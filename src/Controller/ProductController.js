const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE, URLIMAGE } = require('@Config/Config');

class ProductController extends MainController {
    response = STRUCTURE;
    constructor(){
        super();
    }

    getStatisticProduct(){
        let response = this.structure;
        return new Promise(async (resolve) => {
            try{
                let produkAct = await database.produk.connection.raw(
                    `SELECT 
                    COUNT(id)
                    FROM produk
                    WHERE produk_is_active = 1
                    `
                );
                produkAct = produkAct.rows[0].count
                let produkAll = await database.produk.connection.raw(
                    `SELECT 
                    COUNT(id)
                    FROM produk
                    `
                );
                produkAll = produkAll.rows[0].count
    
                let Kategori = await database.produk.connection.raw(
                    `SELECT 
                    COUNT(id_group)
                    FROM produk_group
                    `
                );
                Kategori = Kategori.rows[0].count
    
                response.state = true;
                response.data = {
                    produkaktif: produkAct,
                    produk: produkAll,
                    kategori: Kategori
                };
                response.code = 100;
                response.message = "Sukses mendapatkan statistik";
                resolve(response);

            }catch(err){
                console.log(err);
                response.state = false;
                response.data = {};
                response.code = 102;
                response.message = "Gagal mendapatkan statistik";
                resolve(response);
            }
        })
    }

    getCategory(){
        return new Promise(async (resolve) => {
            let response = this.response;
            try{
                let data = await database.produk_group.all()
                if(data.length > 0){
                    data = data.map(d => {
                        return {
                            nama: d.group_nama,
                            groupid: d.id_group,
                            active: Number(d.is_active)
                        }
                    })
                    response.state = true;
                    response.data = data;
                    response.code = 100;
                    response.message = "Sukses mendapatkan Kategori";
                    return resolve(response);
                }else{
                    throw err;
                }
            }catch(err){
                response.state = false;
                response.data = [];
                response.message = "Gagal mendapatkan Kategori Produk";
                response.code = 102;
                return resolve(response);
            }
            
        })
    }

    getSingleCategory = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let result = await database.produk_group.allSelect({id_group: body.groupid});
                    if(result.length > 0){
                        result = result[0];
                        response.data = {
                            nama: result.group_nama,
                            gambar: result.gambar_group,
                            groupid: result.id_group,
                            active: Number(result.is_active),
                            urlImage: `${URLIMAGE}${result.gambar_group}`
                        };
                        response.message = "Success to get Category";
                        response.code = 100;
                        response.state = true
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = "Failed to get Category";
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

    getAllProduct(fields, body){
        let response = this.structure;
        return new Promise( async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let data = await database.produk.all();
                    let ret = [];
                    for(let idx = 0; idx < data.length; idx++){
                        let d = data[idx];
                        let statusbuy = await database.transaksi.allSelect({trx_id_profile: body.id, trx_produk_id : d.produk_id});
                        let groupNama = await database.produk_group.single({id_group: d.produk_id_group})
                        let res = {
                            produkid: d.produk_id,
                            nama: d.produk_namaProduk,
                            groupid: d.produk_id_group,
                            active: Number(d.produk_is_active),
                            harga: Number(d.produk_harga),
                            kodeproduk: d.produk_kodeProduk,
                            keterangan: d.produk_keterangan,
                            created: d.produk_created_at,
                            updated: d.produk_updated_at,
                            cover: URLIMAGE+d.produk_cover,
                            link: d.produk_link,
                            idpembuat: d.produk_id_profile,
                            statusbuy: statusbuy.length,
                            namagroup: groupNama.group_nama
                        }
                        ret.push(res);
                    }
                    response.state = true;
                    response.data = ret;
                    response.code = 100;
                    response.message = "Sukses mendapatkan Produk";
                    return resolve(response);
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                console.log(err)
                response.state = false;
                response.data = [];
                response.message = "Gagal mendapatkan Produk";
                response.code = 102;
                return resolve(response);
            }
        })
    }

    createProduct(fields, body){
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    // console.log(body);
                    let insertData = {
                        produk_namaProduk: body.nama,
                        produk_id_group: body.tipe,
                        produk_harga: body.harga,
                        produk_kodeProduk: this.makeid(10),
                        produk_keterangan: body.keterangan,
                        produk_is_active: 1,
                        produk_cover: body.cover,
                        produk_id: this.generateID(),
                        produk_link: body.link,
                        produk_id_profile: body.id,
                        produk_certificate: body.certificate
                    }

                    let insert = await database.produk.insertOne(insertData);
                    if(insert.state){
                        response.data = body;
                        response.message = "Success to Create Produk";
                        response.code = 100;
                        response.state = true
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = "Failed to Create Produk";
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

    getGroupedProduct(){
        return new Promise( async (resolve) => {
            try{

            }catch(err){
                response.state = false;
                response.data = [];
                response.message = "Gagal mendapatkan Grouping Produk";
                response.code = 102;
                return resolve(response);
            }
        })
    }

    getGroupedProductWithKey(groupid){
        return new Promise( async (resolve) => {
            try{
                let data = await database.produk.allSelect({produk_id_group: groupid})
                if(data.length > 0){
                    // 
                }else{
                    throw err;
                }
            }catch(err){
                response.state = false;
                response.data = [];
                response.message = "Gagal mendapatkan Grouping Produk";
                response.code = 102;
                return resolve(response);
            }
        })
    }

    getSingleProduct(fields, body){
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let kategoriData = await database.produk_group.connection.raw(`
                    SELECT 
                    produk_group.group_nama as nama,
                    produk_group.is_active as active,
                    produk_group.gambar_group as gambargroup,
                    produk_group.id_group as groupid
                    FROM
                    produk_group
                    `);
                    kategoriData = kategoriData.rows;
                    let data = await database.produk.connection.raw(`
                    SELECT 
                    produk.produk_cover as produkcover,
                    produk.produk_created_at as created,
                    produk.produk_harga as produkharga,
                    produk.produk_id as produkid,
                    produk.produk_id_group as groupid,
                    produk.produk_id_profile as adminid,
                    produk.produk_is_active as isactiveproduk,
                    produk.produk_keterangan as keteranganproduk,
                    produk."produk_kodeProduk" as kodeproduk,
                    produk.produk_link as linkproduk,
                    produk."produk_namaProduk" as namaproduk,
                    produk.produk_updated_at as updated,
                    produk.produk_certificate as produk,
                    profile.prl_nama as namaadmin,
                    profile.prl_username as adminusername,
                    produk_group.group_nama as tipegroup,
                    CONCAT('${URLIMAGE}', produk.produk_certificate) as produk_link,
                    CONCAT('${URLIMAGE}', produk.produk_cover) as cover_link
                    from produk
                    JOIN profile on profile.prl_profile_id = produk.produk_id_profile
                    join produk_group on produk_group.id_group = produk.produk_id_group
                    WHERE
                    produk.produk_id = '${body.produkid}'
                    AND
                    produk."produk_kodeProduk" = '${body.kodeproduk}'
                    `)
                    if(data.rows.length > 0){
                        let retData = data.rows[0];
                        let statusbuy = await database.transaksi.allSelect({trx_id_profile: body.id, trx_produk_id : body.produkid});
                        // console.log(statusbuy.length)
                        // retData.statusbuy = statusbuy.length;
                        // console.log(retData)
                        // data = retData;
                        // data.kategoriList = kategoriData;
                        response.data = {
                            ...retData,
                            statusbuy: statusbuy.length
                        };
                        response.code = 100;
                        response.state = true;
                        response.message = "Success get Detail Produk";
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = `Failed get Detail Produk`;
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
                response.state = false;
                response.data = {};
                response.message = "Produk tidak Ditemukan";
                response.code = 102;
                return resolve(response);
            }
        })
    }

    createCategory = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    const insertData = {
                        group_nama: body.nama,
                        gambar_group: body.image,
                        is_active: 1,
                        id_group: this.generateID()
                    }
                    let insert = await database.produk_group.insertOne(insertData);
                    if(insert.state){
                        response.data = {
                            id: insertData.id_group,
                            nama: body.nama,
                            image: body.image
                        };
                        response.message = `Success Create Kategori`;
                        response.code = 100;
                        response.state = true
                        resolve(response)
                    }else{
                        response.data = {};
                        response.message = `Failed Create Kategori`;
                        response.code = 103;
                        response.state = false
                        throw response
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

    updateCategory = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let update = {
                        where: {
                            id_group: body.id
                        },
                        update: {
                            group_nama: body.nama
                        }
                    }
                    if(newBody.includes('image')){
                        update.update.gambar_group = body.image;
                    }
                    let updated = await database.produk_group.updateOne(update.where, update.update);
                    if(updated.state){
                        response.data = {
                            id: body.id
                        };
                        response.message = "Success Update Kategori Produk";
                        response.code = 100;
                        response.state = true
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = "Failed to update Kategori Produk";
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
                resolve(err)
            }
        });
    }

    deleteCategory = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let result = await database.produk_group.deleteOne({id_group: body.id});
                    console.log(result);
                    if(result.state){
                        response.data = {
                            id: body.id
                        };
                        response.message = `Success Delete '${body.id}'`;
                        response.code = 100;
                        response.state = true
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = "Failed to Delete Category";
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

    updateProduct = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let b = new Map(Object.entries(body));
                    let update = {
                        where: {
                            produk_id: body.produkid,
                        }, 
                        update: {
                            produk_namaProduk: body.name,
                            produk_keterangan: body.keterangan,
                            produk_id_group: body.tipeproduk,
                            produk_link: body.link,
                            produk_harga: body.harga
                        }
                    }
                    if(b.has('certificate')) update.update.certificate = body.certificate;
                    if(b.has('cover')) update.update.cover = body.cover;

                    let upd = await database.produk.updateOne(update.where, update.update);
                    if(upd.state){
                        response.data = body;
                        response.code = 100;
                        response.state = true;
                        response.message = "Success Update Produk";
                        resolve(response);
                    }else{
                        response.data = {};
                        response.code = 103;
                        response.state = false;
                        response.message = "Failed Update Produk";
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
                resolve(err);
            }
        });
    }

    deleteProduk = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let result = await database.produk.deleteOne({produk_id: body.id});
                    console.log(result);
                    if(result.state){
                        response.data = body;
                        response.message = `Success Delete Produk '${body.id}'`;
                        response.code = 100;
                        response.state = true
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = "Failed to Delete Produk";
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

    search = (value) => {
        // Search on Produk
        // Search on category also
        
    }
    

}

module.exports = new ProductController;