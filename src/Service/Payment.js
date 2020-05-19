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

    router.post('/sendTopup', VerifyMiddleware, async (req, res) => {
        let uploadImage = await PaymentController.uploadImage(req);
        if(uploadImage.state){
            let data = uploadImage.data.fieldData;
            data.image = uploadImage.data.image
            let response = await PaymentController.uploadBuktiTransfer(['id', 'image', 'kode_unik'], data);
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
        res.send(response);
    })

    router.get('/listBank', VerifyMiddleware, async (req, res) => {
        let response = await PaymentController.getListBank();
        return res.send(response)
    })
    return router;
}