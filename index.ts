// require('module-alias/register');
import 'module-alias/register';

import express = require('express');
import cors = require('cors');
import compression = require('compression');
import bodyParser = require('body-parser');
import helmet = require('helmet');
import http = require('http');

const app = express();
const server = http.createServer(app);
const { PORT, NAME, VERSION } = require('@Config/Config');

const { shouldCompress } = require('@Middleware/Compress');

app.use(helmet());
app.use(cors());
app.use(compression({filter: shouldCompress}));
app.use(bodyParser.urlencoded({
	extended: true,
	parameterLimit: 4096,
	limit: '100mb'
}));
app.disable('x-powered-by');

app.use('/api', require('@Service/index'));

server.listen(PORT, () => {
    console.log(`Service Server ${NAME}\nversion '${VERSION}\nrunning on localhost:${PORT}\n`);
    console.log(`API Endpoint /api/v${VERSION.split('.')[0]}/{ nama modul }`)
})