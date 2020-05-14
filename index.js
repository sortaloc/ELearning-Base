require('module-alias/register');

const express = require('express');
const { Request, Response } = require('express');
const Cors = require('cors');
const Compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const http = require('http');
const Cookie = require('cookie-parser');

// const { applyMiddleware } = require("@Util/index");
// const errorHandlers = require("@Middleware/ErrorHandlers");
// const { shouldCompress } = require('@Middleware/Compress');
const { MiddlewareValidation } = require('@Middleware/Security');

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

// app.use(MiddlewareValidation) //Middleware Security

app.use('/api', require('@Service/index'));
app.get('/', (req, res) => {
    res.send(true)
})
// applyMiddleware(errorHandlers, app);

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