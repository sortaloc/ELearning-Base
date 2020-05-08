require('dotenv').config();

module.exports = {
	PORT: process.env.PORT || 9000,
	SERVICE_PORT: process.env.SUB_PORT.split(',').map(data => Number(data))
}