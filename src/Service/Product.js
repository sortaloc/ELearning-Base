const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const ProductController = require('@Controllers/ProductController');
const Busboy = require('connect-busboy');

module.exports = (router) => {
    router.use(Busboy({
        highWaterMark: 50 * 1024 * 1024, // Set 50MiB buffer
    })); // Insert the busboy middle-ware
    
    // router.get('/', (req, res) => {
    //     res.send(true);
    // })

    router.post('/upload', async (req, res) => {
        console.log(req.body)
        let uploadImage = await ProductController.uploadImage(req);
        console.log(uploadImage)
        return res.send(uploadImage);
    })

    // router.post('/getHistory', VerifyMiddleware, async (req, res) => {
    //     res.send(true);
    // })

    router.post('/statistic', VerifyMiddleware, async (req, res) => {
        let data = await ProductController.getStatisticProduct();
        return res.send(data)
    })
    

    router.post('/getAllProduct', VerifyMiddleware, async (req, res) => {
        let data = await ProductController.getAllProduct(['id'], req.body);
        return res.send(data);
    });

    router.post('/search', VerifyMiddleware, async (req, res) => {
        let data = await ProductController.search(req.body.search);
        return res.send(true);
    })

    // router.post('/getAllGroupedProduct', VerifyMiddleware, async (req, res) => {
    //     let data = await ProductController.getGroupedProduct();
    //     res.send(true);
    // });

    // router.post('/getAllProductWithGroup', VerifyMiddleware , async (req, res) => {
    //     let data = await ProductController.getGroupedProductWithKey(req.body.groupid);
    //     res.send(true);
    // })

    router.post('/getSingleProduct', VerifyMiddleware, async (req, res) => {
        req.body.token = req.headers.authorization.split(' ');
        req.body.token = req.body.token[req.body.token.length - 1];
        let data = await ProductController.getSingleProduct(['id', 'produkid', 'kodeproduk'], req.body);
        res.send(data);
    })

    router.post('/createProduct', VerifyMiddleware , async (req, res) => {
        let uploadImage = await ProductController.uploadImage(req);
        if(Boolean(uploadImage.state) === true){
            let data = uploadImage.data.fieldData;
            // data.image = uploadImage.data.image[0].name
            let response = await ProductController.createProduct(['nama', 'keterangan', 'harga', 'tipe', 'cover'], data);
            return res.send(response)
        }else{
            return res.status(500).send({state: false, message: "Failed to Upload Image", code: 105})
        }
    })

    router.post('/updateProduct', VerifyMiddleware, async (req, res) => {
        let uploadImage = await ProductController.uploadImage(req);
        if(Boolean(uploadImage.state) === true){
            let data = uploadImage.data.fieldData;
            let response = await ProductController.updateProduct(['produkid', 'name', 'keterangan', 'tipeproduk', 'link', 'harga'], data);
            return res.send(response)
        }else{
            return res.status(500).send({state: false, message: "Failed to Upload Image", code: 105})
        }
    })

    router.post('/deleteProduk', VerifyMiddleware, async (req, res) => {
        let response = await ProductController.deleteProduk(['id'], req.body);
        return res.send(response);
    })

    router.post('/getAllCategory', VerifyMiddleware, async (req, res) => {
        let data = await ProductController.getCategory();
        res.send(data);
    })

    router.post('/getSingleCategory', VerifyMiddleware, async (req, res) => {
        let data = await ProductController.getSingleCategory(['groupid'], req.body);
        res.send(data);
    })

    router.post('/createCategory', VerifyMiddleware , async (req, res) => {
        let uploadImage = await ProductController.uploadImage(req);
        if(Boolean(uploadImage.state) === true){
            let data = uploadImage.data.fieldData;
            data.image = uploadImage.data.image[0].name
            let response = await ProductController.createCategory(['image', 'nama'], data);
            return res.send(response)
        }else{
            return res.status(500).send({state: false, message: "Failed to Upload Image", code: 105})
        }
    })

    router.post('/updateCategory', VerifyMiddleware, async (req, res) => {
        let uploadImage = await ProductController.uploadImage(req);
        if(Boolean(uploadImage.state) === true){
            let data = uploadImage.data.fieldData;
            if(uploadImage.data.image.length > 0){
                data.image = uploadImage.data.image[0].name
            }
            let response = await ProductController.updateCategory(['nama', 'id'], data);
            return res.send(response);
        }else{
            return res.status(500).send({state: false, message: "Failed to Upload Image", code: 105})
        }
    })

    router.post('/deleteCategory', VerifyMiddleware, async (req, res) => {
        console.log(req.body);
        let response = await ProductController.deleteCategory(['id'], req.body);
        console.log(response)
        return res.send(response);
    })
    
    return router;
}