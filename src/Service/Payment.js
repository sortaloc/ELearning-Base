const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const PaymentController = require('@Controllers/PaymentController');
const Busboy = require('connect-busboy');

module.exports = (router) => {

    router.use(Busboy({
        highWaterMark: 50 * 1024 * 1024, // Set 50MiB buffer
    })); // Insert the busboy middle-ware

    router.post('/requestTopup', async (req, res) => {
        let response = await PaymentController.createDeposit(['id', 'nominal'], req.body);
        return res.send(response);
    })

    router.post('/sendTopup', async (req, res) => {
        let uploadImage = await PaymentController.uploadImage(req);
        console.log(uploadImage)

        res.send(true);
    })
    return router;
}