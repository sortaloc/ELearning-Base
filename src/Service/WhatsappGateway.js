const WhatsappGateway = require('@Controllers/WhatsappGateway');

module.exports = (router) => {
    router.post('/incomingMessage', async (req, res) => {
        let validasiWhatsapp = WhatsappGateway.validasi(['SmsMessageSid', 'SmsSid', 'To', 'Body', 'From', 'AccountSid'], req.body);
        if(validasiWhatsapp){
            console.log('hehe')
        }else{
            return res.status(500).send({state: false, code: 105, data: {}, message: "Invalid Input"});
        }
        // res.send(true)
    })
    return router;
}