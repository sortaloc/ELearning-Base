// import { Request, Response } from 'express';
const RegisterController = require('@Controllers/RegisterController');
const VerifyMiddleware = require('@Middleware/VerifyMiddleware');

module.exports = (router) => {
    router.post('/Register', async (req, res) => {
        let validasiRegister = await RegisterController.registerUser(['nohp', 'nama', 'username', 'password', 'tipe', 'otp'], req.body);
        res.send(validasiRegister);
    })

    router.post('/Register/DashboardAdmin', VerifyMiddleware, async (req, res) => {
        let validasiRegister = await RegisterController.registerUserDashboard(['nohp', 'nama', 'username', 'password', 'tipe'], req.body);
        res.send(validasiRegister);
    })

    router.post('/validasi', async (req, res) => {
        let validasi = await RegisterController.validasi(['nohp', 'username', 'email', 'otp'], req.body);
        res.send(validasi);
    })

    router.post('/whatsappRegister', async (req, res) => {
        let registerWhatsapp = await RegisterController.registerWhatsapp(req.body, res);
        res.send(registerWhatsapp);
    })

    return router;
}