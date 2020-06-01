const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const HistoryController = require('@Controllers/HistoryController');
const Busboy = require('connect-busboy');

module.exports = (router) => {
	// router.post('/', VerifyMiddleware, async (req, res) => {
	// 	let response = await HistoryController.getAllHistory(['id'], req.body);
	// 	res.send(response);
	// })

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
		res.send(true)
	})
	return router;
};