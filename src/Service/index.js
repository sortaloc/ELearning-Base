require('module-alias/register');

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const basename = path.basename(__filename);
const router = express.Router();

const { VERSION } = require('@Config/Config');

let ver = VERSION.split('.')[0];

// router.use(bodyParser.urlencoded({
// 	extended: false,
// 	parameterLimit: 4096,
// 	limit: '100mb'
// }));

// router.use(bodyParser.urlencoded({extended: false}))

fs.readdirSync(__dirname)
.filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file !== file.split('.')[0]+'.d.ts');
}).forEach((file) => {
    let RouteApi = `/v${ver}/${file.substring(0, file.length - 3)}`
    console.log(RouteApi)
    router.use(RouteApi, require(`@Service/${file}`)(router));
})

module.exports = router;