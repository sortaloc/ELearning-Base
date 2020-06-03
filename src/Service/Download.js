const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const DownloadController = require('@Controllers/DownloadController');
const Busboy = require('connect-busboy');

module.exports = (router) => {
	router.get('/Certificate/:image', VerifyMiddleware, async (req, res) => {
                req.body = req.params;
		req.body.token = req.headers.authorization.split(' ');
                req.body.token = req.body.token[req.body.token.length - 1];
                let response = await DownloadController.Download(req.body);
                res.status(response.http);
                if(response.state){
                	res.sendFile(response.data);
                }else{
                	res.send(response);
                }
	})

        router.get('/Ebook/:image', VerifyMiddleware, async (req, res) => {
                req.body = req.params;
                req.body.token = req.headers.authorization.split(' ');
                req.body.token = req.body.token[req.body.token.length - 1];
                let response = await DownloadController.Download(req.body);
                res.status(response.http);
                if(response.state){
                        res.sendFile(response.data);
                }else{
                        res.send(response);
                }
        })
        router.get('/Presentasi/:image', VerifyMiddleware, async (req, res) => {
                req.body = req.params;
                req.body.token = req.headers.authorization.split(' ');
                req.body.token = req.body.token[req.body.token.length - 1];
                let response = await DownloadController.Download(req.body);
                res.status(response.http);
                if(response.state){
                        res.sendFile(response.data);
                }else{
                        res.send(response);
                }
        })
	return router;
};