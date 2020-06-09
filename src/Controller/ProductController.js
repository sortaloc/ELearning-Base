const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE, URLIMAGE } = require('@Config/Config');

const moment = require('moment-timezone');

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
                let data = await database.produk_group.connection.raw(
                    'SELECT * FROM produk_group ORDER BY group_nama ASC'
                    )
                data = data.rows;
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
                    // let data = await database.produk.all();
                    let data = await database.produk.connection.raw(`
                        SELECT *
                        FROM
                        produk
                        WHERE
                        produk_is_active = 1
                        ORDER BY produk_end DESC, produk_created_at DESC
                        `)
                    data = data.rows;
                    let ret = [];
                    for(let idx = 0; idx < data.length; idx++){
                        let d = data[idx];
                        let dataTrx = {};
                        let statusbuy = await database.transaksi.allSelect({trx_id_profile: body.id, trx_produk_id : d.produk_id});
                        let groupNama = await database.produk_group.single({id_group: d.produk_id_group})
                        let pemateri = await database.profile.single({prl_profile_id: d.produk_pemateri_id, prl_isactive: 1})

                        if(statusbuy.length > 0){
                            let transaksi = statusbuy[0];
                            dataTrx = {
                                status: transaksi.trx_status,
                                trxid: transaksi.trx_id,
                                keterangan: transaksi.trx_keterangan,
                                trxtipe: transaksi.trx_tipe,
                                harga: transaksi.trx_harga,
                                invoice: transaksi.trx_invoice,
                                refid: transaksi.trx_refid,
                                created: transaksi.trx_created_at
                            }
                        }
                        // if(){
                        // }
                        let res = {
                            startprofisiensi: d.produk_start,
                            endprofisiensi: d.produk_end,
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
                            namagroup: groupNama.group_nama,
                            statusbuydata: dataTrx,
                            namapemateri: pemateri.prl_nama,
                            usernamepemateri: pemateri.prl_username,
                            photopemateri: pemateri.prl_photo,
                            photopematerilink: URLIMAGE+pemateri.prl_photo,
                            buttonbuy: 1
                        }
                        if(res.namagroup.toLowerCase().includes('profisiensi')){
                            let exprDate = new Date(d.produk_end)
                            let nowDate = new Date(moment.tz('Asia/Jakarta').format());
                            if(nowDate > exprDate){
                                res.buttonbuy = 0;
                                // res = {
                                //     ...res,
                                //     buttonbuy: 0
                                // }
                            }else{
                                res.buttonbuy = 1;
                                // res = {
                                //     ...res,
                                //     buttonbuy: 1
                                // }
                            }
                            // console.log(true)
                        }
                        // console.log(res.nama)

                        // cprofile.prl_nama as namapemateri,
                        // cprofile.prl_username as usernamepemateri,
                        // cprofile.prl_photo as photopemateri,
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
                response.code = 106;
                return resolve(response);
            }
        })
    }

    getAllProductMini = (fields, body) => {
        let response = this.structure;
        return new Promise( async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let data = await database.produk.connection.raw(`
                        SELECT
                        a."produk_namaProduk" as nama,
                        a."produk_kodeProduk" as kodeproduk,
                        a.produk_id as produkid,
                        a.produk_id_group as groupid,
                        a.produk_harga as harga,
                        a.produk_is_active as active,
                        g.group_nama as groupnama
                        FROM
                        produk a
                        JOIN (SELECT group_nama, id_group FROM produk_group) g on g.id_group = a.produk_id_group
                        WHERE
                        a.produk_is_active = 1 ORDER BY a.produk_created_at DESC
                        `)
                    response.state = true;
                    response.data = data.rows;
                    response.code = 100;
                    response.message = "Sukses mendapatkan Produk Mini";
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
                err.code = 503;
                err.state = false;
                resolve(err)
            }
        });
    }

    createProduct(fields, body){
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let ids = this.getRandomInt(0, 99);
                    if(ids < 10){
                        ids = `0${ids}`
                    }
                    let insertData = {
                        produk_namaProduk: body.nama,
                        produk_id_group: body.tipe,
                        produk_harga: body.harga,
                        produk_kodeProduk: this.makeid(3)+ids,
                        produk_keterangan: body.keterangan,
                        produk_is_active: 1,
                        produk_cover: body.cover,
                        produk_id: this.generateID(),
                        produk_link: body.link,
                        produk_id_profile: body.id,
                        produk_certificate: body.certificate,
                        produk_pemateri_id: body.pemateri,
                        produk_start: body.startDate,
                        produk_end: body.endDate
                    }

                    console.log(insertData)

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

    // getGroupedProductWithKey(groupid){
    //     return new Promise( async (resolve) => {
    //         try{
    //             let data = await database.produk.allSelect({produk_id_group: groupid})
    //             if(data.length > 0){
    //                 // 
    //             }else{
    //                 throw err;
    //             }
    //         }catch(err){
    //             response.state = false;
    //             response.data = [];
    //             response.message = "Gagal mendapatkan Grouping Produk";
    //             response.code = 102;
    //             return resolve(response);
    //         }
    //     })
    // }

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
                        a.produk_cover as produkcover,
                        a.produk_created_at as created,
                        a.produk_harga as produkharga,
                        a.produk_id as produkid,
                        a.produk_id_group as groupid,
                        a.produk_id_profile as adminid,
                        a.produk_is_active as isactiveproduk,
                        a.produk_keterangan as keteranganproduk,
                        a."produk_kodeProduk" as kodeproduk,
                        a.produk_link as linkproduk,
                        a."produk_namaProduk" as namaproduk,
                        a.produk_updated_at as updated,
                        a.produk_certificate as produk,
                        a.produk_viewed as produkview,
                        a.produk_buy as produkbuy,
                        a.produk_start as startprofisiensi,
                        a.produk_end as endprofisiensi,
                        CONCAT('${URLIMAGE}', a.produk_certificate) as produk_link,
                        CONCAT('${URLIMAGE}', a.produk_cover) as cover_link,
                        bprofile.prl_nama as namaadmin,
                        bprofile.prl_username as adminusername,
                        cprofile.prl_nama as namapemateri,
                        cprofile.prl_username as usernamepemateri,
                        cprofile.prl_photo as photopemateri,
                        CONCAT('${URLIMAGE}', cprofile.prl_photo) as photopematerilink,
                        c.group_nama as tipegroup
                        from produk a
                        JOIN (SELECT prl_profile_id, prl_nama, prl_username FROM profile WHERE prl_isactive = 1) bprofile on bprofile.prl_profile_id = a.produk_id_profile
                        JOIN (SELECT prl_profile_id, prl_nama, prl_username, prl_photo FROM profile WHERE prl_isactive = 1) cprofile on cprofile.prl_profile_id = a.produk_id_profile
                        JOIN (SELECT group_nama, id_group FROM produk_group) c on a.produk_id_group = c.id_group
                        WHERE
                        a.produk_id = '${body.produkid}'
                        AND
                        produk_is_active = 1
                    `)
                    if(data.rows.length > 0){
                        let retData = data.rows[0];
                        let statusbuy = await database.transaksi.allSelect({trx_id_profile: body.id, trx_produk_id : body.produkid});

                        await database.produk.connection.raw(`UPDATE produk SET produk_viewed = produk_viewed + 1 WHERE produk_id = '${body.produkid}'`);
                        let dataTrx;
                        if(statusbuy.length > 0){
                            let transaksi = statusbuy[0];
                            dataTrx = {
                                status: transaksi.trx_status,
                                trxid: transaksi.trx_id,
                                keterangan: transaksi.trx_keterangan,
                                trxtipe: transaksi.trx_tipe,
                                harga: transaksi.trx_harga,
                                inboice: transaksi.trx_invoice,
                                refid: transaksi.trx_refid,
                                created: transaksi.trx_created_at
                            }
                            if(transaksi.trx_tipe === 'BUYPROFISIENSI'){
                                let parse = JSON.parse(transaksi.trx_data);
                                dataTrx = {
                                    ...dataTrx,
                                    username: parse.username,
                                    password: parse.password
                                }
                            }
                        }
                        response.data = {
                            ...retData,
                            statusbuy: statusbuy.length,
                            statusbuydata: dataTrx
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
                response.code = 105;
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
                    // console.log(result);
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
                    // console.log(result);
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

    search = (fields, body) => {
         let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    // let kategoriSearch = await database.produk_group.connection.raw(`SELECT * FROM produk_group WHERE UPPER(group_nama) LIKE '%${body.search.toUpperCase()}%' ORDER BY group_nama ASC`)
                    let kategoriData = await database.produk_group.connection.raw(`
                    SELECT 
                    produk_group.group_nama as nama,
                    produk_group.is_active as active,
                    produk_group.gambar_group as gambargroup,
                    produk_group.id_group as groupid
                    FROM
                    produk_group
                    `);
                    let data = await database.produk.connection.raw(
                        `
                        SELECT * FROM produk 
                        WHERE 
                        UPPER(produk."produk_namaProduk") LIKE '%${body.search.toUpperCase()}%'
                        OR
                        UPPER(produk."produk_kodeProduk") LIKE '%${body.search.toUpperCase()}%'
                        `
                        );
                    let ret = [];
                    data = data.rows;
                    for(let idx = 0; idx < data.length; idx++){
                        let d = data[idx];
                        let dataTrx = {};
                        let statusbuy = await database.transaksi.allSelect({trx_id_profile: body.id, trx_produk_id : d.produk_id});
                        let groupNama = await database.produk_group.single({id_group: d.produk_id_group})
                        let pemateri = await database.profile.single({prl_profile_id: d.produk_pemateri_id, prl_isactive: 1})

                        if(statusbuy.length > 0){
                            let transaksi = statusbuy[0];
                            dataTrx = {
                                status: transaksi.trx_status,
                                trxid: transaksi.trx_id,
                                keterangan: transaksi.trx_keterangan,
                                trxtipe: transaksi.trx_tipe,
                                harga: transaksi.trx_harga,
                                inboice: transaksi.trx_invoice,
                                refid: transaksi.trx_refid,
                                created: transaksi.trx_created_at
                            }
                        }
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
                            namagroup: groupNama.group_nama,
                            statusbuydata: dataTrx,
                            namapemateri: pemateri.prl_nama,
                            usernamepemateri: pemateri.prl_username,
                            photopemateri: pemateri.prl_photo,
                            photopematerilink: URLIMAGE+pemateri.prl_photo
                        }
                        ret.push(res);
                    }


                    response.state = true;
                    response.data = {
                        produk: ret,
                        kategori: kategoriData.rows
                    };
                    response.code = 100;
                    response.message = `Success Search, Produk Found ${ret.length}`
                    resolve(response);
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response)
                }
            }catch(err){
                console.log('Something Error', err);
                err.code = 503;
                err.state = false;
                err.message = 'Something Error';
                err.data = JSON.stringify(err);
                resolve(err);
            }
        });
        
    }

    getRecomended = (fields, body) => {
         let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    // Rekomendasi ambil dari yang paling banyak di download
                    let data = await database.transaksi.connection.raw(
                        `
                        select 
                        count(a.trx_produk_id) as download,
                        a.trx_produk_id as produkid,
                        prd."produk_kodeProduk" as kodeproduk,
                        prd."produk_namaProduk" as namaproduk,
                        prd.produk_harga as hargaproduk,
                        prd.produk_id_group as groupid,
                        prd.produk_cover as produkcover,
                        prd.produk_keterangan as keteranganproduk,
                        CONCAT('${URLIMAGE}', prd.produk_certificate) as produk_link,
                        CONCAT('${URLIMAGE}', prd.produk_cover) as cover_link,
                        bprofile.prl_nama as namaadmin,
                        bprofile.prl_username as adminusername,
                        cprofile.prl_nama as namapemateri,
                        cprofile.prl_username as usernamepemateri,
                        cprofile.prl_photo as photopemateri,
                        CONCAT('${URLIMAGE}', cprofile.prl_photo) as photopematerilink,
                        prdg.group_nama as tipegroup
                        from transaksi a
                        JOIN (SELECT * FROM produk) prd on prd.produk_id = a.trx_produk_id
                        JOIN (SELECT * FROM produk_group) prdg ON prdg.id_group = prd.produk_id_group

                        JOIN (SELECT prl_profile_id, prl_nama, prl_username FROM profile WHERE prl_isactive = 1) bprofile on bprofile.prl_profile_id = prd.produk_id_profile
                        JOIN (SELECT prl_profile_id, prl_nama, prl_username, prl_photo FROM profile WHERE prl_isactive = 1) cprofile on cprofile.prl_profile_id = prd.produk_id_profile
                        where a.trx_data LIKE '%download%'
                        GROUP BY a.trx_produk_id, prd."produk_namaProduk", prd.produk_harga, prd.produk_id_group, prdg.group_nama, prd."produk_kodeProduk",prd.produk_cover, prd.produk_keterangan, prd.produk_certificate, prd.produk_cover, bprofile.prl_nama, bprofile.prl_username, cprofile.prl_nama, cprofile.prl_username, cprofile.prl_photo, photopematerilink
                        ORDER BY download DESC
                        LIMIT 5
                        `
                        )
                    // console.log(data.rows);
                    if(data.rows.length === 0){
                        let rekomendasi = await database.transaksi.connection.raw(
                            `SELECT
                            0 as download,
                            prd.produk_id as produkid,
                            prd."produk_kodeProduk" as kodeproduk,
                            prd."produk_namaProduk" as namaproduk,
                            prd.produk_harga as hargaproduk,
                            prd.produk_id_group as groupid,
                            prd.produk_cover as produkcover,
                            prd.produk_keterangan as keteranganproduk,
                            CONCAT('${URLIMAGE}', prd.produk_certificate) as produk_link,
                            CONCAT('${URLIMAGE}', prd.produk_cover) as cover_link,
                            prd.produk_id_profile,
                            bprofile.prl_nama as namaadmin,
                            bprofile.prl_username as adminusername,
                            cprofile.prl_nama as namapemateri,
                            cprofile.prl_username as usernamepemateri,
                            cprofile.prl_photo as photopemateri,
                            CONCAT('${URLIMAGE}', cprofile.prl_photo) as photopematerilink,
                            prdg.group_nama
                            FROM
                            produk prd
                            JOIN (SELECT * FROM produk_group) prdg ON prdg.id_group = prd.produk_id_group
                            JOIN (SELECT * FROM profile WHERE prl_isactive = 1) bprofile ON bprofile.prl_profile_id = prd.produk_id_profile
                            JOIN (SELECT * FROM profile WHERE prl_isactive = 1) cprofile ON cprofile.prl_profile_id = prd.produk_id_profile
                            ORDER BY random()
                            LIMIT 5
                            `
                            )
                        data = rekomendasi;
                    }

                    response.data = data.rows;
                    response.code = 100;
                    response.state = true;
                    response.message = "Success Get Rekomendasi";
                    resolve(response)
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                console.log(err)
                err.code = 503;
                err.state = false;
                resolve(err)
            }
        });
    }
    

}

module.exports = new ProductController;