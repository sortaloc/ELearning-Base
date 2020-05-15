const VerifyMiddleware = require('@Middleware/VerifyMiddleware');

module.exports = (router) => {
    router.post('/getCategory', VerifyMiddleware, (req, res) => {
        console.log(req);
        res.send(true);
    })
    return router;
}