require('module-alias/register');
const db = {};
[
    'account',
    'admin',
    'bank',
    'cashflow', 
    'certificate_user',
    'code_voucher', 
    'deposit',
    'elearning', 
    'evoucher', 
    'inbox', 
    'login',
    'otp_list', 
    'outbox', 
    'profisiensi',
    'produk', 
    'produk_group',
    'profile', 
    'setting', 
    'transaksi', 
]
.forEach(file => {
    const modelName = file;
    let dataClass = require('@Controllers/DatabaseController')
    dataClass = new dataClass(modelName)
    db[modelName] = dataClass
})

module.exports = db;