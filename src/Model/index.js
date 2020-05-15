require('module-alias/register');
const db = {};
// fs.readdirSync(dirname)
// .filter(file => {
//     console.log()
//     return (file.indexOf('.') !== 0) && (file !== basename) && (file !== file.split('.')[0]+'.d.ts');
// })
[
    'account',
    'admin',
    'cashflow', 
    'code_voucher', 
    'elearning', 
    'inbox', 
    'outbox', 
    'profile', 
    'setting', 
    'transaksi', 
    'evoucher', 
    'otp_list', 
    'produk', 
    'produk_group',
]
.forEach(file => {
    const modelName = file;
    let dataClass = require('@Controllers/DatabaseController')
    dataClass = new dataClass(modelName)
    db[modelName] = dataClass
})

module.exports = db;