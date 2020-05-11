import compression = require('compression');
import { Request, Response } from 'express';
const { STRUCTURE } = require('@Config/Config');

export const shouldCompress = (req: Request, res: Response) => {
    if(req.headers['x-no-compression']){
        let response = STRUCTURE;
        response.code = 105;
        response.message = 'No Compress Data';
        res.send(105);
    }
    return compression.filter(req, res);
}