'use strict';

const _ = require('lodash');
const Logger = require('./logger');

const cfg = require('./../../config.json');
const defaultCfg = cfg.development,
    environmentCfg = cfg[process.env.NODE_ENV || 'development'],
    finalConfig = _.merge(defaultCfg, environmentCfg);

global.config = finalConfig;
Logger.debug(`Using config for environment ${global.config.environment}`);
