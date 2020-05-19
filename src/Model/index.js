require('module-alias/register');
const db = {};
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
    'bank',
    'deposit',
    'login'
]
.forEach(file => {
    const modelName = file;
    let dataClass = require('@Controllers/DatabaseController')
    dataClass = new dataClass(modelName)
    db[modelName] = dataClass
})

module.exports = db;