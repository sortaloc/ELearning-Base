import { Request, Response, NextFunction, Router } from "express";
const { HTTPClientError, HTTP404Error } = require("@Controllers/HttpErrors");

const handle404Error = (router: Router) => {
  router.use((req: Request, res: Response) => {
    throw new HTTP404Error("Method not found.");
  });
};

const handleClientErrors = (router: Router) => {
  router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HTTPClientError) {
      console.error(err);
      res.status(404).send(err.message);
    } else {
      next(err);
    }
  });
};

const handleServerErrors = (router: Router) => {
  router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    if (process.env.NODE_ENV === "production") {
      res.status(500).send("Internal Server Error");
    } else {
      res.status(500).send(err.stack);
    }
  });
};

export default [handle404Error, handleClientErrors, handleServerErrors];