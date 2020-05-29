const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const LibraryController = require('@Controllers/LibraryController');
const Busboy = require('connect-busboy');

module.exports = (router) => {
        router.post('/get', VerifyMiddleware, async (req, res) => {
        	let response  = await LibraryController.getLibrary(['id'], req.body);
            res.send(response)
        })
	return router;
};