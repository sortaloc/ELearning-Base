// require('module-alias/register');
import 'module-alias/register';

import express = require('express');
import cors = require('cors');
import compression = require('compression');
import bodyParser = require('body-parser');
import helmet = require('helmet');
import http = require('http');

import { applyMiddleware } from "@Util/index";
import errorHandlers from "@Middleware/ErrorHandlers";
import { shouldCompress } from '@Middleware/Compress';

const { PORT, NAME, VERSION } = require('@Config/Config');
const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(compression({filter: shouldCompress}));
app.use(bodyParser.urlencoded({
	extended: true,
	parameterLimit: 4096,
	limit: '100mb'
}));
app.disable('x-powered-by');
applyMiddleware(errorHandlers, app);

app.use('/api', require('@Service/index'));

server.listen(PORT, () => {
    console.log(`Service Server ${NAME}\nversion '${VERSION}\nrunning on localhost:${PORT}\n`);
    console.log(`API Endpoint /api/v${VERSION.split('.')[0]}/{ nama modul }`)
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