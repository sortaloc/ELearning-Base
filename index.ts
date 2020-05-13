import 'module-alias/register';

import express = require('express');
import { Request, Response } from 'express';
import cors = require('cors');
import compression = require('compression');
import bodyParser = require('body-parser');
import helmet = require('helmet');
import http = require('http');

import { applyMiddleware } from "@Util/index";
import errorHandlers from "@Middleware/ErrorHandlers";
import { shouldCompress } from '@Middleware/Compress';
import { MiddlewareValidation } from '@Middleware/Security';

const { PORT, NAME, VERSION } = require('@Config/Config');
const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(compression({filter: shouldCompress}));
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