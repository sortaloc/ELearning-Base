import { Request, Response } from 'express';
const LoginController = require('@Controllers/LoginController');

module.exports = (router: any) => {
    router.post('/LoginUsername', (req: Request, res: Response) => {
        console.log(req.baseUrl)
        let responseData = LoginController.loginValidate(['username', 'password'], req.body)
        res.send(true)
    })

    return router;
}