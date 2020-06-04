const UtilizationController = require('@Controllers/UtilizationController.js');

module.exports = (router) => {

    router.get('/getNumber', async (req, res) => {
    	let response = await UtilizationController.getNumber();
    	res.send(response).status(200);
    })

    // router.get('/getCS', async (req, res) => {
    // 	let response = await UtilizationController.getCS();
    // 	res.send(response).status(200);
    // })

    return router;
}