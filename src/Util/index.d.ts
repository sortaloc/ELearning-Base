import { Router, Request, Response, NextFunction } from "express";
declare type Wrapper = ((router: Router) => void);
export declare const applyMiddleware: (middlewareWrappers: Wrapper[], router: Router) => void;
declare type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
declare type Route = {
    path: string;
    method: string;
    handler: Handler | Handler[];
};
export declare const applyRoutes: (routes: Route[], router: Router) => void;
export {};
