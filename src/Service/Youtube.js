// const SecureController = require('@Controllers/SecureController');
const { YOUTUBEKEY } = require('@Config/Config');
// const request = require('node-fetch');
// const request = require('request')

// const youtubeService = require('youtube-api-es6').youtubeService;
// const youtubeConfig = {
//     key: YOUTUBEKEY
// };

module.exports = (router) => {

    router.get('/', async (req, res) => {
    	res.send(YOUTUBEKEY)
    	// const x = await request('h




    	// req.pipe(x);
    	// x.pipe(res);
    })

    return router;
}