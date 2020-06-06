const LoginController = require('@Controllers/LoginController');
const VerifyMiddleware = require('@Middleware/VerifyMiddleware');


module.exports = (router) => {
    router.post('/Login', async (req, res) => {
        req.body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let response = await LoginController.loginValidate(['input', 'password', 'group'], req.body)
        return res.send(response);
    })

    router.post('/Logout', VerifyMiddleware, async (req, res) => {
        req.body.token = req.headers.authorization.split(' ');
        req.body.token = req.body.token[req.body.token.length - 1];
        let response = await LoginController.logout(req.body);
        return res.send(response);
    })

    router.post('/requestForgotPassword', async (req, res) => {
        let response = await LoginController.requestForgotPassword(['value'], req.body);
        res.send(response);
    })

    router.post('/validasiOTP', async (req, res) => {
        let response = await LoginController.validasiOTPForgotPassword(['otp', 'nohp'], req.body);
        res.send(response);
    })

    router.post('/confirmForgot', async (req, res) => {
        let response = await LoginController.confirmForgotPassword(['email', 'username', 'nohp', 'otp', 'newPassword', 'id'], req.body);
        res.send(response);
    })

    /*
    * Buat Force Logout
    */
    /*router.get('/testLogout', async (req, res) => {
        let response = await LoginController.testLogout();
        res.send(response);
    })*/

    return router;
}