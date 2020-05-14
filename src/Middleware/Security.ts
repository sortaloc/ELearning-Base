import { Request, Response, NextFunction } from "express";

// Security Headers and raw Data Function

// Flow security
// Bisa pake headers
// Dan pake di body

export const MiddlewareValidation = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers)
    
    next();
}