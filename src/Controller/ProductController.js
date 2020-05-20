const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE } = require('@Config/Config');

class ProductController extends MainController {
    response = STRUCTURE;
    constructor(){
        super();
    }

    getCategory(){
        return new Promise(async (resolve) => {
            let response = this.response;
            try{
                let data = await database.produk_group.allSelect({is_active: '1'})
                if(data.length > 0){
                    data = data.map(d => {
                        return {
                            nama: d.group_nama,
                            gambar: d.gambar_group,
                            groupid: d.id_group
                        }
                    })
                    data.map((d) => {
                        return {

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

    getAllProduct(){
        return new Promise( async (resolve) => {
            try{
                let data = await database.produk.all();
                if(data.length > 0){
                    response.state = true;
                    response.data = data;
                    response.code = 100;
                    response.message = "Sukses mendapatkan Produk";
                    return resolve(response);
                }else{
                    throw err;
                }
            }catch(err){
                response.state = false;
                response.data = [];
                response.message = "Gagal mendapatkan Produk";
                response.code = 102;
                return resolve(response);
            }
        })
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
    

}

module.exports = new ProductController;