const ProfileController = require('@Controllers/ProfileController')
const VerifyMiddleware = require('@Middleware/VerifyMiddleware')
const Busboy = require('connect-busboy')

module.exports = (router) => {
    router.use(Busboy({
        highWaterMark: 50 * 1024 * 1024, // Set 50MiB buffer
    })) // Insert the busboy middle-ware
    
    router.post('/getProfile', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.getDetailProfile(['id'], req.body)
        return res.send(response)
    })

    router.post('/updateProfile', VerifyMiddleware, async (req, res) => {
        req.body.token = req.headers.authorization.split(' ');
        req.body.token = req.body.token[req.body.token.length - 1];
        // let response = await ProfileController.updateProfile(['nama', 'tanggal_lahir', 'tempat_lahir', 'gender', 'username', 'gelar', 'gelar_profesi', 'password'], req.body)
        let response = await ProfileController.updateProfile(['id', 'password'], req.body)
        return res.send(response)
    })

    router.post('/updatePhoto', VerifyMiddleware, async (req, res) => {
        let uploadImage = await ProfileController.uploadImage(req)
        if(Boolean(uploadImage.state) === true){
            console.log(uploadImage);
            // let data = uploadImage.data.fieldData
            data = uploadImage.data.fieldData;
            // data.image = uploadImage.data.image[0].name
            let response = await ProfileController.updatePhoto(['id', 'image'], data)
            res.send(response)
        }else{
            res.status(500).send({state: false, message: "Failed to Upload Image", code: 105})
        }
    })

    router.post('/checkUsername', async (req, res) => {
        let response = await ProfileController.checkUsername(['username'], req.body)
        return res.send(response)
    })

    router.post('/getKotaIndonesia', async (req, res) => {
        let response = ProfileController.getKota()
        return res.send(response)
    })

    router.get('/getPhoto/:id', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.getProfilePicture(['id'], req.params)
        res.send(response)
    })

    router.post('/changePassword', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.changePassword(['id', 'password'], req.body);
        res.send(true);
    })

    router.post('/verityOTPchangePassword', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.verifyOTPChangePassword(['id', 'otp'], req.body);
        res.send(true);
    })

    // Dashboard
    router.post('/all', VerifyMiddleware, async(req, res) => {
        let response = await ProfileController.getAll()
        res.send(response)
    })

    router.post('/detail', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.detailUser(['id', 'profileid'], req.body)
        res.send(response)
    })

    router.post('/searchProfile', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.search(['id', 'search'], req.body);
        res.send(response)
    })

    router.post('/suspendUser', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.suspend(['id', 'profileid'], req.body);
        res.send(true);
    })
    return router
}