require('module-alias/register');

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const basename = path.basename(__filename);
const router = express.Router();

const { VERSION } = require('@Config/Config');

let ver = VERSION.split('.')[0];

fs.readdirSync(__dirname)
.filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (path.extname(file) === '.js');
}).forEach((file) => {
    let RouteApi = `/v${ver}/${file.substring(0, file.length - 3)}`
    console.log(RouteApi)
    let RouterRoute = require(`@Service/${file}`)(router)
    router.use(RouteApi, RouterRoute);
})

module.exports = router;