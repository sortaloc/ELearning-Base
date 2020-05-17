require('module-alias/register')

let MainController = require('@Controllers/MainController.js');
MainController = new MainController;

console.log(MainController.generateID());