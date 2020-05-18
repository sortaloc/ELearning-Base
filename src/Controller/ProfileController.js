const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE } = require('@Config/Config');

const fs = require('fs-extra');
const path = require('path')

const kota = require('@Util/KotaIndonesia.json');

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
                    let profile = await database.profile.allSelect({prl_profile_id: body.id});
                    if(profile.length > 0){
                        profile = profile[profile.length - 1];
                        console.log(profile);
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
                            saldo: profile.prl_saldo_nexus
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
                    let pwd = this.createPassword(body.password);
                    let where = {
                        prl_username: body.username,
                        prl_password: pwd
                    }
                    let profile = await database.profile.allSelect(where);
                    console.log
                    if(profile.length > 0){
                        profile = profile[0];
                        let update = body;
                        delete update.password;
                        if(newBody.includes('newPassword')){
                            update.password = this.createPassword(body.newPassword);
                        }
                        delete update.id;
                        delete update.newPassword;
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
                    let profile = await database.profile.connection.raw(`SELECT * FROM profile WHERE prl_username = '${body.username}'`);
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
                            console.log('Array', subData)
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
                    // console.log(body);
                    let updated = await database.profile.updateOne({prl_profile_id: body.id}, {prl_photo: body.image});
                    // let data = await database.profile.allSelect({prl_profile_id: body.id});
                    // console.log(data)
                    // console.log(body)
                    // console.log(updated)
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
}

module.exports = new ProfileController