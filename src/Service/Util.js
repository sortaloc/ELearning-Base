const UtilizationController = require('@Controllers/UtilizationController.js');

module.exports = (router) => {

    router.get('/getWA', async (req, res) => {
    	let response = await UtilizationController.getWA();
    	res.send(response).status(200);
    })

    router.get('/getCS', async (req, res) => {
    	let response = await UtilizationController.getCS();
    	res.send(response).status(200);
    })

    return router;
}