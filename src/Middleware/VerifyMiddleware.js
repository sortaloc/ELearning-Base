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
            return res.status(403).send({auth: false, message: 'No Token Provided'});
        }
    
        jwt.verify(token, cipherID, async (err, decoded) => {
            if(err){
                return res.status(500).send({auth: false, code: 500, message: 'Failed to authenticate token'});
            }
            let validasi = await database.profile.allSelect({prl_profile_id: decoded.id});
            if(Number(validasi.length) === 0){
                return res.status(500).send({auth: false, message: 'User Not Found'});
            }
            next();
        })
    }catch(err){
        return res.status(500).send({auth: false, code: 500, message: 'Failed to authenticate token'});
    }
    
    
}

module.exports = verifyToken;