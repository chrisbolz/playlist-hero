'use strict';

const {google} = require('googleapis');

const Client = require('../client');

const youtube = google.youtube({
    version: 'v3',
    auth: Client.oAuth2Client
});

class Subs {
    constructor() {
    }

    static async getOwnSubscriptions (etag) {
        const headers = {};
        if (etag) {
            headers['If-None-Match'] = etag;
        }

        const res = await youtube.activities.list({
            home: true,
            part: 'snippet, contentDetails'
        });
        return res.data;
    };
}

module.exports = new Subs();