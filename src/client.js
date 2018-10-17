'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const opn = require('opn');
const destroyer = require('server-destroy');
const querystring = require('querystring');

const {google} = require('googleapis');

const keyPath = path.join(__dirname, '../oauth2.keys.json');
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
            console.log('invalid');
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
            // grab the url that will be used for authorization
            this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes.join(' '),
            });
            //TODO: use express?? use res.setHeader.
            const server = http
                .createServer(async (req, res) => {
                    try {
                        if (req.url.indexOf('/oauth2callback') > -1) {
                            const qs = querystring.parse(url.parse(req.url).query);
                            server.destroy();
                            const {tokens} = await this.oAuth2Client.getToken(qs.code);
                            this.oAuth2Client.credentials = tokens;
                            res.end(
                                'Authentication successful! Please return to the console.', 'UTF-8', destroyer(server)
                            );
                            resolve(this.oAuth2Client);
                        }
                    } catch (e) {
                        reject(e);
                    }
                })
                .listen(8045, () => {
                    // open the browser to the authorize url to start the workflow
                    opn(this.authorizeUrl, {wait: false}).then(cp => cp.unref());
                });
            destroyer(server);
        });
    }


}

module.exports = new Client();
