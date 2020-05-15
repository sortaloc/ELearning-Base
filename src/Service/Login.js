// import { Request, Response } from 'express';
const LoginController = require('@Controllers/LoginController');

module.exports = (router) => {
    router.post('/', async (req, res) => {
        console.log(req.baseUrl)
        let responseData = await LoginController.loginValidate(['username', 'password'], req.body)
        return res.send(responseData);
    })

    return router;
}