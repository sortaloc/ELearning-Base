// const SecureController = require('@Controllers/SecureController');
// const request = require('node-fetch');
const request = require('request')

module.exports = (router) => {

    router.get('/', async (req, res) => {
    	const x = await request('https://www.youtube.com/watch?v=5rwYjRzLHHI&feature=emb_rel_err')
    	console.log(x);
    	req.pipe(x);
    	x.pipe(res);
    })

    return router;
}