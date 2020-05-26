const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const CashflowController = require('@Controllers/CashflowController');
// const Busboy = require('connect-busboy');

module.exports = (router) => {
	router.get('/AllCashflow', VerifyMiddleware, async (req, res) => {
                let response = await CashflowController.getAllCashflow(['id'], req.body);
                res.send(true);
	})
	return router;
};