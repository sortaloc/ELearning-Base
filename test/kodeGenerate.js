require('module-alias/register')

let MainController = require('@Controllers/MainController.js');
MainController = new MainController;

let id = MainController.makeid(10);
console.log(id);
process.exit();