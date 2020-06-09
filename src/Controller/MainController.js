const database = require('@Model/index');
const FCM = require('@Controllers/FCMController.js');

const crypto = require('crypto');
const utf8 = require('utf8');
const jwt = require('jsonwebtoken');
require('moment');
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Jakarta");
const { CIPHERID, STRUCTURE, SLEEP, GEOLOCATION } = require('@Config/Config');

const API = require('@Helper/API.js');

const path = require('path')
const basename = path.basename(__filename);
const fs = require('fs-extra');
const fsNorm = require('fs');

const busboy = require('connect-busboy');

const uploadPath = path.join(__dirname, '../Source/');
fs.ensureDir(uploadPath);

const { kodeOtpSelect } = require('@Query/QueryModel');

class MainController {
    cipherID = CIPHERID;
    structure = STRUCTURE;

    constructor(){}

    romanize = (num) => {
      var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},roman = '',i;
        for ( i in lookup ) {
            while ( num >= lookup[i] ) {
              roman += i;
              num -= lookup[i];
            }
        }
        return roman;
    }

    decipherToken = (token) => {
        return new Promise(async resolve => {
            jwt.verify(token, this.cipherID, async (err, decoded) => {
                if(err) resolve({state: false, data: {}})

                resolve(decoded);
            });

        })

    }

    getLocation = (ipAddress = '192.1.1.1') => {
        return new Promise(async (resolve) => {
            let url = `http://api.ipstack.com/${ipAddress}?access_key=${GEOLOCATION}`
            let result = await API.get(url);
            resolve(result);
        })
    }

    commandJobs(){
        return new Promise(resolve => {
            return resolve({state:true, data: null, sleep: SLEEP})
        })
    }

    convertDate = (date) => {
        return moment(date).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
    }

    switchingCommand = () =>{
        return new Promise(async resolve => {
          let JamSekarang = Number(moment().format('HH'))
          let cutStart, cutEnd

          cutStart = 23;
          cutEnd = 1;

          if (JamSekarang >= cutStart || JamSekarang < cutEnd) {
            setTimeout(() => {
              console.log(`Cutout Inbox, ${new Date()}`)
              return resolve({state:false, 'data': 'Cutout Inbox', SLEEP})
            }, (6000 * 10) * 10)
          } else {
            return resolve({state:true, 'data': null, SLEEP})
          }
        })
      }

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

    createInvoice (type) {
        let uID = crypto.randomBytes(6).toString('hex')
        uID = parseInt(uID, 16)
        let invoice = `${type}-${uID}`;
        return invoice
    }
    random = (start= 1, end= 9)=> {
        const val = Math.floor(start + Math.random() * end)
        return val
    }
    getRandomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    milli = ()=> {
        const hrTime = process.hrtime()
        return hrTime[0] * 1000 + hrTime[1] / 1000000
    }
    validateDate(date){
        let retDate = date < 10 ? `0${date}` : date
        return retDate
    }

    createDate = (add = 24, type= 'hours') => {
        if(['hours', 'days', 'months', 'years', 'minutes', 'secods'].includes(type)){
            let date = moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ssZ")
            date = moment(date).add(24, type).format('YYYY-MM-DDTHH:mm:ssZ');
            return date;
        }else{
            return null;
        }
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
        let otp = this.random(1000000000, 9999999999);
        return otp;
    }

    generateKodeUnik = () => {
        // let kode = this.random(100, 999);
        let kode = Math.floor(Math.random()*(999-100+1)+100);
        return kode;
    }

    getToday = () => {
        return `${moment().tz("Asia/Jakarta").format("YYYY-MM-DD")}`;
    }

    createToken = (data) => {
        const token = jwt.sign(data, this.cipherID, {expiresIn: 0x31536000});
        return {auth: true, token: token};
    }

    uploadImage = (req) => {
        return new Promise(resolve => {
            let response = this.structure;
            let request = req
            req.pipe(req.busboy)

            let imageCount = 0;
            var imageRespon = [];
            var dataSource = {};

            req.busboy.on('file', (fieldname, file, filename, encoding, mime) => {
                let name= filename.split('.')
                let typeFiles = mime.split('/')
                // name[0] = name[0].replace('/ /gi', '_');
                name[0] = name[0].replace(/\s/g,'');
                name[0] = name[0].replace(/[^0-9a-z]/gi, '');
                name = `${this.generateID()}_${name[0]}.${name[name.length-1]}`;

                const fstream = fs.createWriteStream(path.join(uploadPath, name))

                imageCount++;

                file.pipe(fstream);

                dataSource[fieldname] = name;

                imageRespon.push({
                    name: name,
                    type: mime
                })

                fstream.on('close', () => {
                    file.unpipe(fstream);
                });

                fstream.on('error', (err) => {
                    console.log('asdasdasd',err)
                })
            })

            req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
                dataSource[fieldname] = val;
            });


            req.busboy.on('finish', function(){
                req.unpipe(req.busboy);
                response.data = {
                    fileLength: imageCount,
                    fieldData: dataSource,
                    image: imageRespon
                };
                response.code = 100;
                response.state = true;
                response.message = "Berhasil Upload File";
                resolve(response);
            })

            req.busboy.on('error', function(){
                console.log('eError on Busboy')
                response.data = {};
                response.code = 101;
                response.state = false;
                response.message = "Gagal Upload File";
                resolve(response);
            })

        })
    }

    sendNotif = (in_data) => {
        return new Promise(async resolve => {
            let { data } = in_data;
            let send;
            if(data.send === 'user'){
                send = `/topics/user_${data.id}`
                delete data.send;
            }else{
                send = `/topics/global_`
                delete data.send;
            }

            let newData = {
                data: data,
                to: send
            }
            console.log(newData);
            let sendingNotif = await FCM.sendFCM(newData);
            // console.log(sendingNotif)
            resolve(sendingNotif)
        })
    }

    makeid = (length) => {
        var result           = '';
        // abcdefghijklmnopqrstuvwxyz
        // 0123456789
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    convertToRupiah(angka){
        var rupiah = '';
        var angkarev = angka.toString().split('').reverse().join('');
        for(var i = 0; i < angkarev.length; i++) if(i%3 == 0) rupiah += angkarev.substr(i,3)+'.';
        return 'Rp. '+rupiah.split('',rupiah.length-1).reverse().join('');
    }

    FormatMsg = (key) => {
      let data = {
        command: key[0],
        kode: key[1],
        productid: key[2],
        harga: key[3],
        profileid: key[4],
        refid: key[5]
      } 
      return data;
    }

    statusDeposit = (status) => {
        status = Number(status);
        switch(status){
            case 0: {
                return 'Transaksi sedang diproses';
            } break;
            case 1: {
                return 'Transaksi sedang diproses';
            } break;
            case 2: {
                return 'Diproses oleh Sistem'
            } break;
            case 3: {
                return 'Topup Expired';
            } break;
            case 4: {
                return 'Berhasil Topup';
            } break;
            case 5: {
                return 'Topup Failed';
            } break;
            case 6: {
                return 'Topup Ditolak oleh Admin';
            } break;
        }
    }

    getKodeOTP = (getNumber) => {
        return new Promise(async resolve => {
            const numberPhone = getNumber;
            const kode = this.generateOTP();
            const query = kodeOtpSelect(kode, numberPhone, this.getToday())
            let OTPDatabase = await database.otp_list.connection.raw(query)
            if(OTPDatabase.rows > 0){
                getKodeOTP()
            }
            const otp_listStructure = {
                otp_nohp: numberPhone,
                otp_kode: kode,
                otp_status: 0
            }
            const result = await database.otp_list.insertOne(otp_listStructure);
            result.kode = kode;
            resolve(result);
        })

        // if(result){
        //     return kode;
        // }else{
        //     res.writeHead(500, {'Content-Type': 'text/xml'});
        //     res.end(twiml.toString());
        // }
    }

}
module.exports = MainController;