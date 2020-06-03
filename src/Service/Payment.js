const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const PaymentController = require('@Controllers/PaymentController');
const Busboy = require('connect-busboy');

module.exports = (router) => {
    router.use(Busboy({
        highWaterMark: 50 * 1024 * 1024, // Set 50MiB buffer
    })); // Insert the busboy middle-ware

    router.post('/requestTopup', VerifyMiddleware, async (req, res) => {
        let response = await PaymentController.createDeposit(['id', 'nominal', 'id_bank'], req.body);
        return res.send(response);
    })

    router.post('/listRequestTopup', VerifyMiddleware, async (req, res) => {
        let response = await PaymentController.listRequestTopup(['id'], body);
        return res.send(true);
    })

    router.post('/sendTopup', VerifyMiddleware, async (req, res) => {
        let uploadImage = await PaymentController.uploadImage(req);
        if(uploadImage.state){
            let data = uploadImage.data.fieldData;
            let response = await PaymentController.uploadBuktiTransfer(['id', 'file', 'kode_unik', 'nominal'], data);
            return res.send(response);
        }else{
            return res.send({
                code: 105,
                state: false,
                data: {},
                message: "Failed to upload images"
            });
        }
    })

    router.get('/listNominal', VerifyMiddleware, async (req, res) => {
        let response = await PaymentController.getListNominal();
        return res.send(response);
    })

    router.get('/listBank', VerifyMiddleware, async (req, res) => {
        let response = await PaymentController.getListBank();
        return res.send(response)
    })

    router.post('/buyCertificate', VerifyMiddleware, async (req, res) => {
        req.body.token = req.headers.authorization.split(' ');
        req.body.token = req.body.token[req.body.token.length - 1];
        let response = await PaymentController.buyProduct(['idproduk', 'id', 'password'], req.body, 'BUYCERTIFICATE');
        return res.send(response);
    })

    router.post('/buyEbook', VerifyMiddleware, async (req, res) => {
        req.body.token = req.headers.authorization.split(' ');
        req.body.token = req.body.token[req.body.token.length - 1];
        // let response = await PaymentController.buyEbook(['idproduk', 'id', 'password'], req.body);
        let response = await PaymentController.buyProduct(['idproduk', 'id', 'password'], req.body, 'BUYEBOOK');
        return res.send(response);
    })

    router.post('/buyProfisiensi', VerifyMiddleware, async (req, res) => {
        req.body.token = req.headers.authorization.split(' ');
        req.body.token = req.body.token[req.body.token.length - 1];
        // let response = await PaymentController.buyEbook(['idproduk', 'id', 'password'], req.body);
        let response = await PaymentController.buyProduct(['idproduk', 'id', 'password'], req.body, 'BUYPROFISIENSI');
        return res.send(response);  
    })

    router.post('/buyPresentasi', VerifyMiddleware, async (req, res) => {
        req.body.token = req.headers.authorization.split(' ');
        req.body.token = req.body.token[req.body.token.length - 1];
        // let response = await PaymentController.buyEbook(['idproduk', 'id', 'password'], req.body);
        let response = await PaymentController.buyProduct(['idproduk', 'id', 'password'], req.body, 'BUYPRESENTASI');
        return res.send(response);  
    })

    // Dashboard
    router.post('/getAllDeposit', VerifyMiddleware, async (req, res) => {
        let response = await PaymentController.getAllDeposit(req.body);
        return res.send(response);
    })

    router.post('/detailDeposit', VerifyMiddleware, async (req, res) => {
        let response = await PaymentController.detailDeposit(['id'], req.body);
        return res.send(response);
    })

    router.post('/processDeposit', VerifyMiddleware, async (req, res) => {
        let response = await PaymentController.processDeposit(['id', 'status', 'adminid'], req.body);
        return res.send(response);
    })
    return router;
}