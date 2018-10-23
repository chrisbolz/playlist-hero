const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');

const Logger = require('./util/logger');
const router = require('./router');

process.env.NODE_ENV = 'development';
const config = require('./util/config');

const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.use('/', router);

const server = app.listen(global.config.port, () => {
    Logger.info(`Playlist-Hero listening on ${global.config.port}!`);
});

app.stop = () => {
    //TODO: use destroyer?
    server.close();
};

module.exports = app;