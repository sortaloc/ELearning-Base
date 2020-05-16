// import { Request, Response } from 'express';
const LoginController = require('@Controllers/LoginController');
const VerifyMiddleware = require('@Middleware/VerifyMiddleware');

// const mw = (req, res, next) => {
//     console.log('lewat middleware');
//     next();
// }

module.exports = (router) => {
    router.post('/', async (req, res) => {
        // console.log(req.baseUrl)
        let responseData = await LoginController.loginValidate(['username', 'password'], req.body)
        return res.send(responseData);
    })

    router.post('/logout', VerifyMiddleware, async (req, res) => {
        req.body.token = req.headers.authorization.split(' ');
        req.body.token = req.body.token[req.body.token.length - 1];
        console.log(req.body);
        let reponse = await LoginController.logout(req.body);
        return res.send(response);
    })

    // router.post('/testLog', mw, (req, res) => {
    //     console.log('doneee')
    //     return res.send(true)
    // })

    return router;
}