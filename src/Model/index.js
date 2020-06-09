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
    'event',
    'evoucher',
    'inbox',
    'login',
    'list_mutasi',
    'otp_list',
    'mutasi_bank',
    'outbox',
    'placement',
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