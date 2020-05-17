const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const PaymentController = require('@Controllers/PaymentController');
const Busboy = require('busboy');

module.exports = (router) => {
    router.post('/requestTopup', async (req, res) => {
        let response = await PaymentController.createDeposit(['id', 'nominal'], req.body);
        return res.send(response);
    })
    return router;
}