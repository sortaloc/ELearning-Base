import 'module-alias/register';

import express = require('express');
import { Request, Response } from 'express';
import Cors from 'cors';
import Compression from 'compression';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import http from 'http';
import Cookie from 'cookie-parser';

import { applyMiddleware } from "@Util/index";
import errorHandlers from "@Middleware/ErrorHandlers";
// import { shouldCompress } from '@Middleware/Compress';
import { MiddlewareValidation } from '@Middleware/Security';

const { PORT, NAME, VERSION } = require('@Config/Config');
const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(Cors());
app.use(Cookie());
// app.use(compression({filter: shouldCompress}));
app.use(Compression())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.disable('x-powered-by');

app.use(MiddlewareValidation) //Middleware Security

app.use('/api', require('@Service/index'));
app.get('/', (req: Request, res: Response) => {
    res.send(true)
})
applyMiddleware(errorHandlers, app);

server.listen(PORT, () => {
    console.log(`Service Server ${NAME}\nversion ${VERSION}\nrunning on localhost:${PORT}\n`);
    console.log(`API Endpoint /api/v${VERSION.split('.')[0]}/{ nama modul }`);
})

// Handle uncaughtError
process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});
// Handle Error
process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
});