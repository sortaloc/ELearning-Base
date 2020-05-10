import 'module-alias/register';

import fs = require('fs');
import path = require('path');
import express = require('express');

const basename = path.basename(__filename);
const router = express.Router();

const { VERSION } = require('@Config/Config');

let fileArray: string[] = [];
let ver: number = VERSION.split('.')[0];
fs.readdirSync(__dirname)
.filter((file: string) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
}).forEach((file: any) => {
    let RouteApi = `/v${ver}/${file.substring(0, file.length - 3)}`
    router.use(RouteApi, require(`@Service/${file}`)(router));
})

module.exports = router;