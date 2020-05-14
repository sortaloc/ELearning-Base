import compression = require('compression');
import { Request, Response, NextFunction } from 'express';
const { STRUCTURE } = require('@Config/Config');

export const shouldCompress = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.originalUrl);
    if(req.headers['x-no-compression']){
        let response = STRUCTURE;
        response.code = 106;
        response.message = 'No Compress Data';
        res.send(105);
    }
    return compression.filter(req, res);
}