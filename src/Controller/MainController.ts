import crypto from 'crypto';
import utf8 from 'utf8';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
moment.tz.setDefault("Asia/Jakarta");
class MainController {
    public cipherID: string = 'l3arn1nGbyd0!n9';
    constructor(){}

    encryption = (dataOriginal: any) => {
        const idcustomer: string = '1234567973' /*Vendor*/
        const pin: string = 'dummyfkpnaye_aye' /*PIN*/
        let date: any = moment().format("YYYYMMDD");
        let data: any = {
            ...dataOriginal,
            date,
            idcustomer
        }
        let dataHeader: any = {
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
    
    private random = (start: number = 1, end: number = 9): number => {
        const val = Math.floor(start + Math.random() * end)
        return val
    }
    private milli = (): number => {
        const hrTime = process.hrtime()
        return hrTime[0] * 1000 + hrTime[1] / 1000000
    }
    private validateDate(date: number): string | number {
        let retDate = date < 10 ? `0${date}` : date
        return retDate
    }

    public generateID = () => {
        let date: any = new Date()
        let year: any = date.getFullYear()
        let month: any = date.getMonth() + 1
        month = this.validateDate(month)
        let day: any = date.getDay() + 1
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
    
        var lastmil: any = this.milli().toString()
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

    public createPassword = (password: string) => {
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

    public generateOTP = () => {
        let otp = this.random(111111, 999999);
        return otp;
    }

    public getToday = (): string => {
        return `${moment().tz("Asia/Jakarta").format("YYYY-MM-DD")}`;
    }



}
module.exports = new MainController;