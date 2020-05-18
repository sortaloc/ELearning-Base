const ProfileController = require('@Controllers/ProfileController');
const VerifyMiddleware = require('@Middleware/VerifyMiddleware');

module.exports = (router) => {
    router.post('/getProfile', VerifyMiddleware, async (req, res) => {
        let response = await ProfileController.getDetailProfile(['id'], req.body);
        return res.send(response);
    })

    router.post('/updateProfile', VerifyMiddleware, async (req, res) => {
        // let response = await ProfileController.updateProfile(['nama', 'tanggal_lahir', 'tempat_lahir', 'gender', 'username', 'gelar', 'gelar_profesi', 'password'], req.body);
        let response = await ProfileController.updateProfile(['id', 'password'], req.body);
        return res.send(response)
    })

    router.post('/updatePhoto', VerifyMiddleware, async (req, res) => {
        let uploadImage = await ProfileController.uploadImage(req);
        console.log(uploadImage);
        if(uploadImage.state){
            let data = uploadImage.data.fieldData;
            data.image = uploadImage.data.image[0].name
            let response = await ProfileController.updatePhoto(['id', 'image'], data);
        }else{

        }
        // res.send(true);
    })

    router.post('/checkUsername', async (req, res) => {
        let response = await ProfileController.checkUsername(['username'], req.body)
        return res.send(response)
    })


    router.post('/getKotaIndonesia', async (req, res) => {
        let response = ProfileController.getKota();
        return res.send(response);
    })
    return router;
}