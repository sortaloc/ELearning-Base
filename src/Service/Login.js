// import { Request, Response } from 'express';
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

    router.post('/forgotPassword', async (req, res) => {
        console.log('reset password, with username, email, or number phone');
        let response = await LoginController.forgotPassword(req.body);
        res.send(true);

    })

    return router;
}