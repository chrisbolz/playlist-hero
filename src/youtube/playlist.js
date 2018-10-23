'use strict';

const {google} = require('googleapis');

const Client = require('../client');

const youtube = google.youtube({
    version: 'v3',
    auth: Client.oAuth2Client
});

class Playlist {
    constructor() {
    }

    static async getData(id, etag) {
        const headers = {};
        if (etag) {
            headers['If-None-Match'] = etag;
        }

        const res = await youtube.playlists.list({
            part: 'snippet, contentDetails',
            id: id,
            headers: headers
        });
        //TODO: is this right?
        return res.data.items[0];
    }

    static async getVideos(id, etag) {
        const headers = {};
        if (etag) {
            headers['If-None-Match'] = etag;
        }

        const res = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: id,
            headers: headers,
            maxResults: 50
        });
        return res.data;
    }
}

module.exports = new Playlist();