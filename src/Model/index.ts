import 'module-alias/register';

import fs from 'fs';
import path from 'path';


const basename = path.basename(__filename);
const dirname = __dirname;

const db = {};

// fs.readdirSync(dirname)
// .filter(file => {
//     console.log()
//     return (file.indexOf('.') !== 0) && (file !== basename) && (file !== file.split('.')[0]+'.d.ts');
// })

['account','admin','cashflow', 'codevoucher', 'elearning', 'inbox', 'outbox', 'profile', 'setting', 'transaksi', 'evoucher', 'otp_list'].forEach(file => {
    const modelName = file;
    let dataClass = require('@Controllers/DatabaseController')
    dataClass = new dataClass(modelName)
    db[modelName] = dataClass
})

module.exports = db;