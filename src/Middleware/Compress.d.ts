/// <reference types="qs" />
import { Request, Response } from 'express';
export declare const shouldCompress: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>) => boolean;
