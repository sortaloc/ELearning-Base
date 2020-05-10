const dotenv = require('dotenv').config();
const pkg = require('@Package');

// dotenv().config;

const sub_port = () => {
	try{
		return process.env.SUB_PORT.split(',').map(data => Number(data));
	}catch(err){
		return new Array(10).fill(1000).map((data, key) => data = data+key);
	}
}

module.exports = {
	PORT: process.env.PORT || 9000,
	SERVICE_PORT: sub_port(),
	DATABASE: {
		uname: process.env.USERDB || 'root',
		passwd: process.env.PASSDB || '',
		host: process.env.HOSTDB || 'localhost',
		port: process.env.PORTDB || '3306',
		dialect: process.env.DIALECTDB || 'pg',
	},
	NAME: pkg.name,
	VERSION: pkg.version
}