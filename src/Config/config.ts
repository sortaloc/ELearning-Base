const dotenv = require('dotenv').config();
const pkg = require('@Package');

const sub_port = () => {
	try{
		return process.env.SUB_PORT.split(',').map(data => Number(data));
	}catch(err){
		return new Array(10).fill(1000).map((data, key) => data = data+key);
	}
}

interface ResponseObject {
	data: any,
	code: number, 
	state: boolean,
	message: string
}

const ResponseStructure: ResponseObject = {
	data: new Object() || new Array(),
	code: 100,
	state: false,
	message: 'Get Data'
}

const urlType = (type: string) => {
	let url: string;
	switch(type){
		case 'pg': {
			url = 'postgresql';
		} break;
	}
	return url;
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
		url: urlType(process.env.DIALECTDB),
		db: process.env.DATABASE || 'profile'
	},
	NAME: pkg.name,
	VERSION: pkg.version,
	STRUCTURE: ResponseStructure
}