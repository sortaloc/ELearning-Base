const crypto = require('crypto');
const utf8 = require('utf8');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Jakarta");
class MainController {
    cipherID = 'l3arn1nGbyd0!n9';
    constructor(){}

    encryption = (dataOriginal) => {
        const idcustomer = '1234567973' /*Vendor*/
        const pin = 'dummyfkpnaye_aye' /*PIN*/
        let date = moment().format("YYYYMMDD");
        let data = {
            ...dataOriginal,
            date,
            idcustomer
        }
        let dataHeader = {
            ...dataOriginal,
            date,
            pin,
            idcustomer
        }

        dataHeader = JSON.stringify(dataHeader)
        dataHeader = dataHeader.replace(/:/gi, ': ')
        dataHeader = dataHeader.replace(/,/gi, ', ')
        let buff = Buffer.from(dataHeader)
        let base64Data = buff.toString('base64')
        base64Data = utf8.encode(base64Data);

        const secretsha1 = 'aku@seorang<kapitan'
        let dataSha1 = crypto
            .createHmac('sha1', secretsha1)
            .update(base64Data)
            .digest('hex')

        const secretjwt = 'aku4bukan@lah12_seorang333patriot'
        const datajwt = jwt.sign({ token: dataSha1 }, secretjwt, {
            algorithm: 'HS256'
        })

        return { data: data, jwt: datajwt, auth: `Bearer ${datajwt}` }
    }
    
    static random = (start= 1, end= 9)=> {
        const val = Math.floor(start + Math.random() * end)
        return val
    }
    static milli = ()=> {
        const hrTime = process.hrtime()
        return hrTime[0] * 1000 + hrTime[1] / 1000000
    }
    static validateDate(date){
        let retDate = date < 10 ? `0${date}` : date
        return retDate
    }

    generateID = () => {
        let date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        month = this.validateDate(month)
        let day = date.getDay() + 1
        day = this.validateDate(day)
    
        let hour = date.getHours()
        hour = this.validateDate(hour)
        let minutes = date.getMinutes()
        minutes = this.validateDate(minutes)
        let second = date.getSeconds()
        second = this.validateDate(second)
    
        let milisec = date.getMilliseconds()
        if (milisec < 10) {
            milisec = `${this.random()}${this.random()}${milisec}`
        } else if (milisec < 100) {
            milisec = `${this.random()}${milisec}`
        }
    
        var lastmil = this.milli().toString()
        if (parseInt(lastmil.length) === 15) {
            lastmil = parseInt(lastmil.substr(lastmil.length - 6))
            if (Number.isNaN(lastmil)) {
            lastmil = this.random(100000, 999999)
            }
        } else {
            lastmil = this.random(100000, 999999)
        }
        let id = `${year}${month}${day}${hour}${minutes}${second}${milisec}${lastmil}`
        id = id.length <= 21 ? `${id}${this.random(10, 99)}` : id
        id = id.length >= 22 ? id.substr(0, 20) : id
        return id
    }

    createPassword = (password) => {
        let buff = Buffer.from(password)
        let base64Data = buff.toString('base64')
        base64Data = utf8.encode(base64Data);

        const secretsha1 = this.cipherID;
        let dataSha1 = crypto
            .createHmac('sha1', secretsha1)
            .update(base64Data)
            .digest('hex')

        return dataSha1
    }

    generateOTP = () => {
        let otp = this.random(1111111111, 9999999999);
        return otp;
    }

    getToday = () => {
        return `${moment().tz("Asia/Jakarta").format("YYYY-MM-DD")}`;
    }



}
module.exports = new MainController;