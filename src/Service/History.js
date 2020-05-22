const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const HistoryController = require('@Controllers/HistoryController');
const Busboy = require('connect-busboy');

module.exports = (router) => {
	router.post('/getAllHistory', VerifyMiddleware, async (req, res) => {
		let 
	})
	return router;
};