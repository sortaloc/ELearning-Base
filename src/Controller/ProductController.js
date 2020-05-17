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
    

}

module.exports = new ProductController;