const dotenv = require('dotenv').config();
const pkg = require('@Package');

const sub_port = () => {
	try{
		return process.env.SUB_PORT.split(',').map(data => Number(data));
	}catch(err){
		return new Array(10).fill(1000).map((data, key) => data = data+key);
	}
}

const ResponseStructure = {
	data: undefined,
	code: 100,
	state: false,
	message: 'Get Data'
}

let urlImage;
if(process.env.NODE_ENV === 'development'){
	urlImage = 'https://devsck.nenggala.id/files/';
	urlData = 'https://devsck.nenggala.id/';
}else{
	urlImage  = 'https://devsck.nenggala.id/files/';
	urlData = 'https://devsck.nenggala.id/';
}

module.exports = {
	PORT: process.env.PORT || 9000,
	SERVICE_PORT: sub_port(),
	NODE_ENV: process.env.NODE_ENV,
	DATABASE: {
		uname: process.env.USERDB || 'root',
		passwd: process.env.PASSDB || '',
		host: process.env.HOSTDB || 'localhost',
		port: process.env.PORTDB || '3306',
		dialect: process.env.DIALECTDB || 'pg',
		url: process.env.DIALECTDB,
		db: process.env.DATABASE || 'profile'
	},
	NAME: pkg.name,
	VERSION: pkg.version,
	STRUCTURE: ResponseStructure,
	WHATSAPP: {
		accountSid: process.env.ACCOUNTSID,
		authToken: process.env.AUTHTOKEN,
		number: process.env.TWLNUMBER
	},
	CIPHERID: process.env.CIPHERID,
	SLEEP: 750,
	URLIMAGE: urlImage,
	GEOLOCATION: process.env.GEOLOCATION,
	FIREBASE: process.env.FIREBASE,
	YOUTUBEKEY: process.env.YOUTUBEKEY,
	URLDATA: urlData,
	BANK: {
		APIKEY: process.env.BANKAPIKEY,
		SIGNATURE: process.env.BANKSIGNATURE
	}
}