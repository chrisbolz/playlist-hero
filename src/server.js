const bodyParser = require("body-parser");
const express = require('express');
const {google} = require("googleapis");

const client = require("../src/client");

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const youtube = google.youtube({
    version: 'v3',
    auth: client.oAuth2Client
});

const getPlaylistData = async etag => {
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
};

app.get('/sample', (req, res) => {

    const scopes = ['https://www.googleapis.com/auth/youtube'];

    client
        .authenticate(scopes)
        .then(async () => {
            const result = await getPlaylistData(null);
            const etag = result.data.etag;
            console.log("etag: " + etag);

            const res2 = await getPlaylistData(etag);
            console.log("res2 status: " + res2.status)
            res.send(JSON.stringify(result));
        })
        .catch(console.error);

});

app.listen(8044, () => {
    console.log('Playlist-Hero listening on 8044!');
});

