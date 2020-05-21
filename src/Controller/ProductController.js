const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE, URLIMAGE } = require('@Config/Config');

class ProductController extends MainController {
    response = STRUCTURE;
    constructor(){
        super();
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

    getAllProduct(){
        return new Promise( async (resolve) => {
            let response = this.structure;
            try{
                let data = await database.produk.all();
                response.state = true;
                response.data = data;
                response.code = 100;
                response.message = "Sukses mendapatkan Produk";
                return resolve(response);
            }catch(err){
                response.state = false;
                response.data = [];
                response.message = "Gagal mendapatkan Produk";
                response.code = 102;
                return resolve(response);
            }
        })
    }

    createProduct(){
        
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

    getSingleProduct(productid){
        return new Promise(async (resolve) => {
            try{
                let data = await database.produk.allSelect({produk_id: productid});
                if(data.length > 0){
                    // 
                    // Get Kategori Group
                }else{
                    throw err;
                }
            }catch(err){
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
                        response.message = `Success Update '${newBody}'`;
                        response.code = 100;
                        response.state = true
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = "Failed to update Category";
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

module.exports = new ProductController;