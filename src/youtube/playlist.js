"use strict";

const {google} = require("googleapis");
const client = require("../client");

const youtube = google.youtube({
    version: 'v3',
    auth: client.oAuth2Client
});

async function getPlaylistData(etag) {
    const headers = {};
    if (etag) {
        headers['If-None-Match'] = etag;
    }

    const res = await youtube.playlists.list({
        part: 'id, snippet',
        id: 'PL1RQwuELCxoycdSERU3sdsEJYNINaiZTO', /*TODO: HERE*/
        headers: headers
    });

    console.log('Status code ' + res.status);
    console.log(res.data);
    return res;
}

async function sample() {
    const res = await getPlaylistData(null);
    const etag = res.data.etag;
    console.log("etag: " + etag);

    const res2 = await getPlaylistData(etag);
    console.log("res2 status: " + res2.status)
}

const scopes = ['https://www.googleapis.com/auth/youtube'];

client
    .authenticate(scopes)
    .then(sample)
    .catch(console.error);