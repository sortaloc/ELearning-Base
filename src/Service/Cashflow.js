const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const DownloadController = require('@Controllers/DownloadController');
// const Busboy = require('connect-busboy');

module.exports = (router) => {
	router.get('/AllCashflow', VerifyMiddleware, async (req, res) => {
                return res.send(true);
	})
	return router;
};