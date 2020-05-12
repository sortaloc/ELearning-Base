import 'module-alias/register';

import fs from 'fs';
import path from 'path';


const basename = path.basename(__filename);
const dirname = __dirname;

const db = {};

fs.readdirSync(dirname)
.filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
})

.forEach(file => {
    const modelName = file.split('.')[0];
    let dataClass = require('@Controllers/DatabaseController');
    dataClass = new dataClass(modelName)
    db[modelName] = dataClass

    // // Unit Test, Development State, testing some function
    // if(modelName === 'account'){
    //     db[modelName].select(['acc_id'])
    //     .then((data:any) => {
    //         console.log(data)
    //         process.exit();
    //     })
    // }
})

module.exports = db;