const { FIREBASE } = require('@Config/Config');

const ApiHelper = require('@Helper/API.js');

class FCMController{
    constructor(){
        this.apiKey = FIREBASE;
        this.url = "https://fcm.googleapis.com/fcm/send";
        this.httpRequest = (data, jwt) => {
            const _d = {
                data: data,
                config:{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization' : `key=${this.apiKey}`
                    }
                }
            }
            return _d;
        }
    }
    checkStatus(res) {
        if (res.ok) { // res.status >= 200 && res.status < 300
            return res;
        } else {
            throw MyCustomError(res.statusText);
        }
    }

    sendFCM(data){
        return new Promise(async (resolve) => {
            let d = this.httpRequest(data);
            let response = await ApiHelper.post(this.url, d.data, d.config);
            resolve(response);
        });

    }

}

module.exports = new FCMController;