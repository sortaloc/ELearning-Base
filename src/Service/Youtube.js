// const SecureController = require('@Controllers/SecureController');
const { YOUTUBEKEY } = require('@Config/Config');
// const request = require('node-fetch');
// const request = require('request')

// const youtubeService = require('youtube-api-es6').youtubeService;
// const youtubeConfig = {
//     key: YOUTUBEKEY
// };

module.exports = (router) => {

    router.get('/thumbnail', async (req, res) => {
    	res.send(YOUTUBEKEY)
    })

    return router;
}