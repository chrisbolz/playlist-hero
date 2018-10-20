'use strict';

//TODO: use config?
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const opn = require('opn');
const destroyer = require('server-destroy');
const querystring = require('querystring');

const {google} = require('googleapis');

const Logger = require('./util/logger');

const keyPath = path.resolve(__dirname, '../oauth2.keys.json');
const htmlPath = path.resolve(__dirname, '../public/html/auth.html');
let keys = {
    redirect_uris: ['http://localhost:8045/oauth2callback'],
};
if (fs.existsSync(keyPath)) {
    const keyFile = require(keyPath);
    keys = keyFile.installed || keyFile.web;
}

class Client {
    constructor(opts) {
        this.options = opts || {scopes: []};

        if (!keys.redirect_uris || keys.redirect_uris.length === 0) {
            throw new Error('invalid redirect Uri!');
        }

        const redirectUri = keys.redirect_uris[keys.redirect_uris.length - 1];
        const parts = url.parse(redirectUri, false);

        if (
            redirectUri.length === 0 ||
            parts.port !== '8045' ||
            parts.hostname !== 'localhost' ||
            parts.path !== '/oauth2callback'
        ) {
            Logger.error('invalid redirect URL');
        }

        // create an oAuth client to authorize the API call
        this.oAuth2Client = new google.auth.OAuth2(
            keys.client_id,
            keys.client_secret,
            redirectUri
        );
    }

    async authenticate(scopes) {
        return new Promise((resolve, reject) => {
            this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes.join(' '),
            });
            //TODO: use express??
            const server = http
                .createServer(async (req, res) => {
                    try {
                        if (req.url.indexOf('/oauth2callback') > -1) {
                            const qs = querystring.parse(url.parse(req.url).query);
                            res.end(
                                'Authentication successful! Please return to the console.'
                            );
                            server.destroy();
                            Logger.info('DAVOR')
                            const {tokens} = await this.oAuth2Client.getToken(qs.code, (err, tokens) => {
                                if(err) {
                                    Logger.info('HALLLOO');
                                    Logger.error(err);
                                } else {
                                    Logger.info('HIIII')
                                }
                            });
                            this.oAuth2Client.credentials = tokens;
                            resolve(this.oAuth2Client);

                        }
                    } catch (e) {
                        Logger.error('Error during authentication');
                        reject(e);
                    }
                })
                .listen(8045, () => {
                    opn(this.authorizeUrl, {wait: false}).then(cp => cp.unref());
                });
            destroyer(server);
        });
    }
}

module.exports = new Client();
