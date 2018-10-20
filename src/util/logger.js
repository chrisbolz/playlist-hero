'use strict';

const { createLogger, format, transports } = require('winston');
const {combine, timestamp, printf} = format;

const fileFormat = printf(info => `${info.timestamp} | ${info.level.toUpperCase()}: ${info.message}`);
const consoleFormat = printf(info => `${info.level.toUpperCase()}: ${info.message}`);

class Logger {
    constructor() {
        this.logger = createLogger({
            transports: [
                new transports.File({
                    level: 'debug',
                    format: combine(timestamp(),fileFormat),
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

    //TODO: test this, evaluate other possibilities
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
