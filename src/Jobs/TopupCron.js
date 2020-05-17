require('module-alias/register')

let MainController = require('@Controllers/MainConftiller.js')
MainController = new MainController;

const processing = async data => {
    let respon = null;
    // Check Connection
    if(data){
        let JOBS = require()


        // After done
        JOBS = null;
        return data;
    }else{
        return
    }
}

const startCron = () => {
    let timeout;
    Promise.all([MainController.switchingCommand])
    .then(process)
    .then(response => {
        setTimeout(startCron, 1)
    })
}

setTimeout(() => startCron(), 10);