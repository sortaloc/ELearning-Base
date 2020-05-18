const ProfileController = require('@Controllers/ProfileController');
const VerifyMiddleware = require('@Middleware/VerifyMiddleware');

module.exports = (router) => {
    router.post('/getProfile', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.getDetailProfile(['id'], req.body);
        res.send(true);
    })
    return router;
}