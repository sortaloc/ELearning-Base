const compression = require('compression');

export const shouldCompress = (req: any, res: any) => {
    if(req.headers['x-no-compression']){
        return false;
    }
    return compression.filter(req, res);
}