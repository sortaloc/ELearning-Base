const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const ProductController = require('@Controllers/ProductController');

module.exports = (router) => {
    router.get('/', (req, res) => {
        res.send(true);
    })
    router.post('/getAllCategory', VerifyMiddleware, async (req, res) => {
        let data = await ProductController.getCategory();
        res.send(data);
    })

    router.post('/getAllProduct', VerifyMiddleware, async (req, res) => {
        let data = await ProductController.getAllProduct();
        res.send(true);
    });

    router.post('/getAllGroupedProduct', VerifyMiddleware, async (req, res) => {
        let data = await ProductController.getGroupedProduct();
        res.send(true);
    });

    router.post('/getAllProductWithGroup', VerifyMiddleware , async (req, res) => {
        // Validasi dahulu groupidnya
        let data = await ProductController.getGroupedProductWithKey(req.body.groupid);
        res.send(true);
    })

    router.post('/getSingleProduct', VerifyMiddleware, async (req, res) => {
        // Validasi Productid
        let data = await ProductController.getSingleProduct(productid);
        res.send(true);
    })

    router.post('/createProduct', VerifyMiddleware , async (req, res) => {

    })

    router.post('/createCategory', VerifyMiddleware , async (req, res) => {

    })
    return router;
}