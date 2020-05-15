class WhatsappGateway {
    validasi(listKey, body){
        let newBody = Object.keys(body);
        let diff = listKey.filter((x) => newBody.indexOf(x) === -1)
        if(diff.length === 0){ //Tidak ada data yang miss
            return true;
        }else{
            return false;
        }
    }
}

module.exports = new WhatsappGateway;