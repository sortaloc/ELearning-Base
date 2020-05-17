require('module-alias/register');

const express = require('express');
const { Request, Response } = require('express');
const Cors = require('cors');
const Compression = require('compression');
const { urlencoded, json } = require('body-parser');
const helmet = require('helmet');
const { createServer } = require('http');
const Cookie = require('cookie-parser');

const busboy = require('connect-busboy');
const busboyBodyParser = require('busboy-body-parser');

// const { applyMiddleware } = require("@Util/index");
// const errorHandlers = require("@Middleware/ErrorHandlers");
// const { shouldCompress } = require('@Middleware/Compress');
// const { MiddlewareValidation } = require('@Middleware/Security');

const { PORT, NAME, VERSION } = require('@Config/Config');
const app = express();
const server = createServer(app);

app.use(helmet());
app.use(Cors());
app.use(Cookie());
// app.use(compression({filter: shouldCompress}));
app.use(Compression())
app.use(urlencoded({extended: false}))
app.use(json())

app.use(busboy());
app.use(busboyBodyParser());

app.disable('x-powered-by');

// app.use(MiddlewareValidation) //Middleware Security

app.use('/api', require('@Service/index'));
app.get('/', (req, res) => {
    return res.send('Hello World');
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

module.exports = app;