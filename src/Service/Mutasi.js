// const VerifyMiddleware = require('@Middleware/VerifyMiddleware');
const MutasiBankController = require('@Controllers/MutasiBankController');
// const Busboy = require('connect-busboy');

module.exports = (router) => {
	router.post('/bank', async (req, res) => {
		let response = await MutasiBankController.insertMutasi(
			['api_key', 'account_id', 'module', 'account_name', 'account_number', 'balance', 'data_mutasi'],
			req.body);
		res.send(response);
	})

	return router;
};