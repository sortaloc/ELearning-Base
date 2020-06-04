const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE, URLIMAGE, WHATSAPP } = require('@Config/Config');

const fs = require('fs-extra');
const path = require('path')

const kota = require('@Util/KotaIndonesia.json');

const { accountSid, authToken } = WHATSAPP;

const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

class ProfileController extends MainController{
    structure = STRUCTURE;
    constructor(){
        super();
    }

    getDetailProfile = (fields, body) => {
        let response = this.structure;
        return new Promise(async resolve => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let profile = await database.profile.allSelect({prl_profile_id: body.id, prl_isactive: 1});
                    if(profile.length > 0){
                        profile = profile[profile.length - 1];
                        // console.log(profile);
                        const data = {
                            id: profile.prl_profile_id,
                            nama: profile.prl_nama,
                            tanggal_lahir: profile.prl_tanggal_lahir,
                            tempat_lahir: profile.prl_tempat_lahir,
                            nohp: profile.prl_nohp,
                            gender: profile.prl_gender,
                            username: profile.prl_username,
                            gelar: profile.prl_gelar,
                            gelar_profesi: profile.prl_gelar_profesi,
                            saldo: profile.prl_saldo_nexus,
                            photo: `${URLIMAGE}${profile.prl_photo}`
                        }
                        response.data = data;
                        response.message = "Data Found";
                        response.code = 100;
                        response.state = true;
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = "Profile not Found";
                        response.code = 103;
                        response.state = false
                        throw response;
                    }
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                resolve(err)
            }
        })
    }

    updateProfile = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    // Check id and Password
                    let id = this.decipherToken(body.token);
                    if(id.id !== body.id){
                        response.data = {};
                        response.code = 106;
                        response.state = false;
                        response.message = 'ID Not Valid';
                    }
                    let where = {
                        prl_profile_id: body.id,
                        prl_isactive: 1
                        // prl_password: pwd
                    }
                    let profile = await database.profile.allSelect(where);
                    // console.log
                    if(profile.length > 0){
                        profile = profile[0];
                        let update = body;
                        delete update.password;
                        if(newBody.includes('newPassword')){
                            update.password = this.createPassword(body.newPassword);
                        }
                        delete update.id;
                        delete update.newPassword;
                        delete update.token;
                        let moveToDbObj = Object.entries(update);
                        let objUpdate = {};
                        for(let idx = 0; idx < moveToDbObj.length; idx++){
                            if(moveToDbObj[idx][1]){
                                objUpdate[`prl_${moveToDbObj[idx][0]}`] = moveToDbObj[idx][1];   
                            }
                        }
                        objUpdate.prl_updated_at = this.createDate();
                        let updated = await database.profile.updateOne({prl_profile_id: profile.prl_profile_id}, objUpdate)
                        if(updated.state){
                            delete update.password;
                            response.data = update;
                            response.message = "Success Update Profile";
                            response.code = 100;
                            response.state = true
                            resolve(response);
                        }else{
                            response.data = {};
                            response.message = "Failed to update profile";
                            response.code = 104;
                            response.state = false
                            throw response;    
                        }
                    }else{
                        response.data = {};
                        response.message = "Profile not Found or Password or username are failed";
                        response.code = 103;
                        response.state = false
                        throw response;
                    }
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                resolve(err);
            }
        })
    }

    checkUsername = (fields, body) => {
        let response = this.structure;
        return new Promise(async resolve => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let profile = await database.profile.connection.raw(`SELECT * FROM profile WHERE prl_username = '${body.username}' AND prl_isactive = 1`);
                    if(profile.rows.length === 0){
                        response.data = body;
                        response.message = "Username not found";
                        response.code = 100;
                        response.state = true
                        resolve(response)
                    }else{
                        response.data = {};
                        response.message = "Username was Exist";
                        response.code = 103;
                        response.state = false
                        throw response;
                    }
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                resolve(err);
            }
        });
    }

    getKota = () => {
        let response = this.structure;
        try{
            const obj = Object.keys(kota);
            let newKota = new Array();
            for(let idx = 0; idx < obj.length; idx++){
                let data = kota[obj[idx]];
                let sub1 = Object.keys(data);
                for(let idc = 0; idc < data[sub1[0]].length; idc++){
                    let subData = data[sub1[0]][idc];
                    let tipe = typeof subData
                    if(tipe === 'string'){
                        newKota.push(subData)
                    }else{
                        if(Array.isArray(subData)){
                            // console.log('Array', subData)
                        }else{
                            let sub2 = Object.keys(subData);
                            for(let idv = 0; idv < sub2.length; idv++){
                                if(Array.isArray(subData[sub2[idv]])) newKota.concat(subData[sub2[idv]]);
                            }
                        }
                    }
                }
            }
            response.data = newKota;
            response.state= 100;
            response.state = true;
            response.message = `Success get city in indonesia`;
            return response;
        }catch(err){
            response.data = {};
            response.state= 102;
            response.state = false;
            response.message = `Error to get File`;
            return response;
        }
    }

    updatePhoto = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let updated = await database.profile.updateOne({prl_profile_id: body.id}, {prl_photo: body.image});
                    if(updated.state){
                        response.data = {
                            id: body.id,
                            image: body.image
                        };
                        response.message = "Success Update Photo Profile";
                        response.code = 100;
                        response.state = true
                        resolve(response);
                    }else{
                        response.data = {};
                        response.message = "Failed to update Photo Profile, profile not found";
                        response.code = 104;
                        response.state = false
                        throw response;    
                    }
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                resolve(err);
            }
        });
    }

    getProfilePicture = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let data = await database.profile.allSelect({prl_profile_id: body.id, prl_isactive: 1});
                    // console.log(data)
                    if(data.length > 0){
                        data = data[0];
                        response.data = {
                            image: data.prl_photo,
                            imageURL:  `${URLIMAGE}${data.prl_photo}`,
                            id: body.id
                        };
                        response.message = "Success to get Photo Profile";
                        response.code = 100;
                        response.state = true
                        throw response;
                    }else{
                        response.data = {};
                        response.message = "Failed to get Photo Profile, profile not found";
                        response.code = 104;
                        response.state = false
                        throw response;
                    }
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                resolve(err);
            }
        });
    }

    getAll = () => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            try{
                let data = await database.profile.connection.raw(`
                SELECT 
                prl_nama as nama,
                prl_nohp as nohp,
                prl_username as username,
                prl_role as role,
                prl_saldo_nexus as saldo_nexus,
                prl_profile_id as id,
                prl_saldo as saldo
                FROM
                profile
                WHERE
                prl_isactive = 1
                `)
                response.data = data.rows
                response.code = 100;
                response.state = true;
                response.message = 'Success to Get All Profile'
                resolve(response);
            }catch(err){
                console.log(err);

                response.data = {}
                response.code = 102;
                response.state = false;
                response.message = 'Failed to Get All Profile'
                resolve(response);
            }
        })
    }

    detailUser = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let data = await database.profile.connection.raw(`
                    SELECT 
                    prl_nama as nama,
                    prl_nohp as nohp,
                    prl_username as username,
                    prl_role as role,
                    prl_saldo_nexus as saldo_nexus,
                    prl_profile_id as id,
                    prl_saldo as saldo,
                    prl_nik as nik,
                    prl_tanggal_lahir as tanggal_lahir,
                    prl_tempat_lahir as tempat_lahir,
                    prl_alamat as alamat,
                    prl_gender as gender,
                    prl_gelar as gelar,
                    prl_gelar_profesi as gelar_profesi,
                    prl_created_at as created,
                    prl_updated_at as updated,
                    prl_isactive as isactive,
                    prl_photo as photo,
                    CONCAT('${URLIMAGE}', prl_photo) as photolink
                    FROM
                    profile
                    WHERE
                    profile.prl_profile_id = '${body.profileid}'
                    AND
                    profile.prl_isactive = 1
                    `)

                    if(data.rows.length > 0){
                        response.data = data.rows[0]
                        response.code = 100;
                        response.state = true;
                        response.message = 'Success to Get All Profile'
                        resolve(response);
                    }else{
                        response.data = data.rows[0]
                        response.code = 103;
                        response.state = false;
                        response.message = 'Failed, Profile Not Found'
                        throw response;
                    }
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    throw response;
                }
            }catch(err){
                resolve(err);
            }
        });
    }

    search = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let data = await database.profile.connection.raw(
                        `
                        SELECT 
                        prl_nama as nama,
                        prl_nohp as nohp,
                        prl_username as username,
                        prl_role as role,
                        prl_saldo_nexus as saldo_nexus,
                        prl_profile_id as id,
                        prl_saldo as saldo
                        FROM profile
                        WHERE
                        UPPER(prl_profile_id) LIKE '%${body.search.toUpperCase()}%'
                        OR
                        UPPER(prl_nama) LIKE '%${body.search.toUpperCase()}%'
                        OR
                        UPPER(prl_nohp) LIKE '%${body.search.toUpperCase()}%'
                        OR
                        UPPER(prl_username) LIKE '%${body.search.toUpperCase()}%'
                        AND
                        prl_isactive = 1
                        `
                        );
                    response.data = data.rows
                    response.code = 100;
                    response.state = true;
                    response.message = `Success Search, ${data.rows.length} Data Found`
                    resolve(response);
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response)
                }
            }catch(err){
                console.log('Something Error', err);
                err.code = 503;
                err.state = false;
                err.message = 'Something Error';
                err.data = JSON.stringify(err);
                resolve(err);
            }
        });
    }

    changePassword = (fields, body) => {
        let response = this.structure;
        return new Promise(async (resolve) => {
            let newBody = Object.keys(body);
            let diff = fields.filter((x) => newBody.indexOf(x) === -1)
            try{
                if(diff.length === 0){
                    let akun = await database.profile.allSelect({prl_profile_id: body.id, prl_password: this.createPassword(body.password), prl_isactive: 1});
                    if(akun.length > 0){

                        let OTP = this.getKodeOTP(akun.prl_nohp);
                        if(!OTP.state){
                            response.data = {};
                            response.message = 'Gagal Mendapatkan Kode OTP, silahkan tunggu beberapa saat lagi';
                            response.code = 104;
                            response.state = false;
                            resolve(response);
                        }

                        OTP = OTP.kode;



                        // let data = await client.messages
                        // .create({
                        //     from: 'whatsapp:+14155238886',
                        //     body: `Kode OTP untuk merubah password ialah`,
                        //     to: `whatsapp:+${akun.prl_nohp}`
                        // })
                        // .then(message => console.log(message));
                    }else{
                        response.data = body;
                        response.message = `Profile tidak ditemukan, cek kembali password yang dikirimkan`;
                        response.code = 103;
                        response.state = false
                        resolve(response)
                    }
                    // console.log(akun)
                }else{
                    response.data = {};
                    response.message = `Input Not Valid, Missing Parameter : '${diff.toString()}'`;
                    response.code = 102;
                    response.state = false
                    resolve(response)
                }
            }catch(err){
                console.log('Something Error', err);
                err.code = 503;
                err.state = false;
                err.message = 'Something Error';
                err.data = JSON.stringify(err);
                resolve(err);
            }
        });
    }
}

module.exports = new ProfileController