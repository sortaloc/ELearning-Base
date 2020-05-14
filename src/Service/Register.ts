import { Request, Response } from 'express';
const RegisterController = require('@Controllers/RegisterController');

module.exports = (router: any) => {
    router.post('/', async (req: Request, res: Response) => {
        let validasiRegister: Object = await RegisterController.registerUser(['nohp', 'nama', 'nik', 'username', 'password', 'tipe', 'otp'], req.body);
        res.send(validasiRegister);
    })

    router.post('/validasi', async (req: Request, res: Response) => {
        let validasi: Object = await RegisterController.validasi(['nohp', 'nik', 'username', 'email'], req.body);
        res.send(validasi);
    })

    router.post('/whatsappRegister', async (req: Request, res: Response) => {
        let registerWhatsapp: object = await RegisterController.registerWhatsapp(req.body);
        res.send(registerWhatsapp);
    })

    return router;
}