const database = require('@Model/index');

const jwt = require('jsonwebtoken')
const { CIPHERID } = require('@Config/Config');
const cipherID = CIPHERID;

const verifyToken = async (req, res, next) => {
    try{
        let token = req.headers['authorization'] || req.headers.authorization;
        token = token.split(' ');
        token = token[token.length - 1];
        if(!token){
            return res.status(403).send({auth: false, state:false, code:500, message: 'No Token Provided'});
        }
    
        jwt.verify(token, cipherID, async (err, decoded) => {
            if(err){
                return res.status(200).send({auth: false, state:false, code:110, message: 'Failed to authenticate token, try again'});
            }
            let validasi = await database.login.allSelect({log_profile_id: decoded.id, log_token: token, log_status: 1});
            if(Number(validasi.length) === 0){
                return res.status(500).send({auth: false, state:false, code:500, message: 'Token Not Valid'});
            }
            next();
        })
    }catch(err){
        return res.status(500).send({auth: false, state:false, code:500, message: 'Failed to authenticate token'});
    }
    
    
}

module.exports = verifyToken;