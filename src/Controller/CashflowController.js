const database = require('@Model/index');
const MainController = require('@Controllers/MainController');
const { STRUCTURE } = require('@Config/Config');

// const path = require('path')
// const basename = path.basename(__filename);
// const fs = require('fs-extra');
// const fsNorm = require('fs');

class CashflowController extends MainController {
	structure;
    constructor(){
        super();
        this.structure = STRUCTURE;
    }
}

module.exports = new CashflowController 