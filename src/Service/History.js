const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const HistoryController = require('@Controllers/HistoryController');
const Busboy = require('connect-busboy');

module.exports = (router) => {

	router.post('/getAllHistory', VerifyMiddleware, async (req, res) => {
		let response = await HistoryController.getAllHistory(['id'], req.body);
		res.send(response);
	})

	router.post('/getSingleHistory', VerifyMiddleware, async (req, res) => {
		let response = await HistoryController.getSingleHistory(['id', 'trx_id', 'trx_refid'], req.body);
		res.send(response);
	})

	router.post('/getTopup', VerifyMiddleware, async (req, res) => {
		let response = await HistoryController.topupList(['id'], req.body);
		res.send(response)
	})

	router.post('/singleTopup', VerifyMiddleware, async (req, res) => {
		let response = await HistoryController.singleTopup(['id', 'iddeposit'], req.body);
		res.send(response)
	})

	/*Dashboard*/

	router.post('/getAllTrx', VerifyMiddleware, async (req, res) => {
		let response = await HistoryController.allTransaction(['id'], req.body);
		res.send(response);
	})
	return router;
};