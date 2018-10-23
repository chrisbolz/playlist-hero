'use strict';

const fs = require('fs');
const path = require('path');
const {createLogger, format, transports} = require('winston');
const {combine, timestamp, printf} = format;

const fileFormat = printf(info => `${info.timestamp} | ${info.level.toUpperCase()}: ${info.message}`);
const consoleFormat = printf(info => `${info.level.toUpperCase()}: ${info.message}`);
const logPath = path.resolve(__dirname, '../../logs');

class Logger {
    constructor() {
        !fs.existsSync(logPath) && fs.mkdirSync(logPath);

        this.logger = createLogger({
            transports: [
                new transports.File({
                    level: 'debug',
                    format: combine(timestamp(), fileFormat),
                    filename: 'logs/combined.log'
                }),
                new transports.Console({
                    level: 'info',
                    format: consoleFormat
                })
            ],
            exceptionHandlers: [
                new transports.File({filename: 'logs/exceptions.log'})
            ]
        });
    }

    info(msg) {
        this.logger.info(msg);
    }

    //TODO: test this, evaluate other error handling
    error(err) {
        this.logger.error(typeof err === 'string' ? err : err.stackTrace);
    }

    debug(msg) {
        this.logger.debug(msg);
    }

    log(level, msg) {
        this.logger.log(level, msg);
    }
}

module.exports = new Logger();
