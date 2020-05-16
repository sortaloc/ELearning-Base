const { STRUCTURE } = require('@Config/Config');

class WhatsappGateway {
    structure = STRUCTURE;
    constructor(){}
    validasi(listKey, body){
        let newBody = Object.keys(body);
        let diff = listKey.filter((x) => newBody.indexOf(x) === -1)
        if(diff.length === 0){ //Tidak ada data yang miss
            return true;
        }else{
            return false;
        }
    }

    gatewayWhatsapp(body){
        return new Promise(async (resolve) => {
            let getText = body.Body;
            let response = this.structure;
            try{
                
                // getText = getText.trim().toLowerCase();
                // if(getText.indexOf('reg') > -1 || getText.indexOf('xus') > -1){ //Jika ada
                //     let getNumber = (number = body.From) => {
                //         number = number.split(':');
                //         number = number[number.length-1];
                //         number = number.replace(/\+/gi, '');
                //         return number;
                //     };

                //     getNumber = getNumber(body.From);
                //     const valNomer = await database.profile.allSelect({prl_nohp: getNumber, prl_isactive: 1})

                //     if(valNomer.length > 0){
                //         response.code = 101;
                //         response.state = false;
                //         response.data = {};
                //         response.message = `Nomor : ${getNumber} telah terdaftar di database`;
                //         twiml.message('Nomor anda telah terdaftar pada aplikasi');
                //         throw response;
                //     }else{
                //         const getKodeOTP = async () => {
                //             let number = getNumber;
                //             const kode = MainController.generateOTP();
                //             let OTPDatabase = await database.otp_list.connection.raw(`
                //             SELECT * FROM 
                //             public.otp_list 
                //             WHERE 
                //             otp_kode LIKE '%${kode}%' AND otp_nohp LIKE '%${number}%' AND otp_created_at LIKE '${MainController.getToday()}%' AND otp_status = 0`)
                //             if(OTPDatabase.rows > 0){
                //                 getKodeOTP()
                //             }

                //             const otp_listStructure = {
                //                 otp_nohp: number,
                //                 otp_kode: kode,
                //                 otp_status: 0
                //             }
                //             const result = await database.otp_list.insertOne(otp_listStructure);
                //             if(result){
                //                 return kode;
                //             }else{
                //                 response.code = 103;
                //                 response.data = {};
                //                 response.state = false;
                //                 response.message = 'Failed to insert OTP';
                //                 twiml.message('Gagal mendapatkan OTP, silahkan coba beberapa saat lagi');
                //                 throw response;
                //             }
                //         }
                //         let OTP = await getKodeOTP();
                //         const message = `Kode OTP anda adalah : ${OTP}`
                //         twiml.message(message);
                //         response.code = 100;
                //         response.data = {otp: OTP, nohp: getNumber};
                //         response.state = true;
                //         response.message = message;
                //         resolve(response)
                //     }
                // }else{
                //     response.code = 102;
                //     response.data = {};
                //     response.state = false;
                //     response.message = 'Command Not Found';
                //     twiml.message('Command tidak ditemukan, Masukkan Reg Nexus untuk memulai');
                //     throw response;
                // }
            }catch(resultError){
                console.log(resultError)
                resolve(resultError)
            }
        })
    }
}

module.exports = new WhatsappGateway;