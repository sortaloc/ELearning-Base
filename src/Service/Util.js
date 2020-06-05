const UtilizationController = require('@Controllers/UtilizationController.js');

module.exports = (router) => {

    router.get('/getUtil', async (req, res) => {
    	let response = await UtilizationController.getNumber();
    	res.send(response).status(200);
    })

    return router;
}