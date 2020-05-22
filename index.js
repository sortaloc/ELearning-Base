require('module-alias/register');

const express = require('express');
// const { Request, Response } = require('express');
const Cors = require('cors');
const Compression = require('compression');
const { urlencoded, json } = require('body-parser');
const helmet = require('helmet');
const { createServer } = require('http');
const Cookie = require('cookie-parser');
const timeout = require('connect-timeout');

const { PORT, NAME, VERSION } = require('@Config/Config');
const app = express();
const server = createServer(app);


app.use(timeout('60s'))
app.use(helmet());
app.use(Cors());
app.use(Cookie());
app.use(Compression())
app.use(urlencoded({extended: false}))
app.use(json())

app.disable('x-powered-by');


app.use('/api', require('@Service/index'));
app.get('/', (req, res) => {
    return res.send('Hello World');
})

app.use('/files', express.static('./src/Source'));

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