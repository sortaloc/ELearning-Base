// import { Request, Response } from 'express';
const RegisterController = require('@Controllers/RegisterController');

module.exports = (router) => {
    router.post('/', async (req, res) => {
        let validasiRegister = await RegisterController.registerUser(['nohp', 'nama', 'nik', 'username', 'password', 'tipe', 'otp'], req.body);
        res.send(validasiRegister);
    })

    router.post('/validasi', async (req, res) => {
        let validasi = await RegisterController.validasi(['nohp', 'nik', 'username', 'email', 'otp'], req.body);
        res.send(validasi);
    })

    router.post('/whatsappRegister', async (req, res) => {
        let registerWhatsapp = await RegisterController.registerWhatsapp(req.body, res);
        res.send(registerWhatsapp);
    })

    return router;
}