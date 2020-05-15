// import { Request, Response } from 'express';
const LoginController = require('@Controllers/LoginController');

// const mw = (req, res, next) => {
//     console.log('lewat middleware');
//     next();
// }

module.exports = (router) => {
    router.post('/', async (req, res) => {
        console.log(req.baseUrl)
        let responseData = await LoginController.loginValidate(['username', 'password'], req.body)
        return res.send(responseData);
    })

    // router.post('/testLog', mw, (req, res) => {
    //     console.log('doneee')
    //     return res.send(true)
    // })

    return router;
}