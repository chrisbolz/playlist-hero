const bodyParser = require("body-parser");
const express = require('express');
const {google} = require("googleapis");
const helmet = require("helmet");

const client = require("./client");
const logger = require('./util/logger');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(helmet());

require('router')(app);

const youtube = google.youtube({
    version: 'v3',
    auth: client.oAuth2Client
});

const youtubeScope = ['https://www.googleapis.com/auth/youtube'];

const getPlaylistDataById = async (etag, id) => {
    const headers = {};
    if (etag) {
        headers['If-None-Match'] = etag;
    }

    const res = await youtube.playlists.list({
        part: 'snippet, contentDetails',
        id: id,
        headers: headers
    });
    return res.data.items[0];
};

const getPlaylistVideosById = async (etag, id) => {
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
};

const getSubscriptions = async  etag => {
    const headers = {};
    if (etag) {
        headers['If-None-Match'] = etag;
    }

    const res = await youtube.activities.list({
        home: true,
        part: 'snippet, contentDetails'
    });
    console.log(res.data);
    return res.data;
};

// TODO: all routes to router, all logic separately

app.get('/sample', (req, res) => {
    client
        .authenticate(youtubeScope)
        .then(async () => {
            //const result = await getPlaylistDataById(null, 'PL1RQwuELCxoycdSERU3sdsEJYNINaiZTO');
            const result = await getPlaylistVideosById(null, 'PL1RQwuELCxoycdSERU3sdsEJYNINaiZTO');
            res.json(result);
        })
        .catch(console.error);
});

app.get('/pl', (req, res) => {
    const id = req.query.id;
    const info = req.query.info;
    client
        .authenticate(youtubeScope)
        .then(async () => {
            const result = info ? await getPlaylistDataById(null, id) : await getPlaylistVideosById(null, id);
            res.json(result);
        })
        .catch(logger.error)
});

app.get('/subs', (req, res) => {
    client
        .authenticate(youtubeScope)
        .then(async () => {
            const result = await getSubscriptions(null);
            res.json(result);
        })
});

const server = app.listen(8044, () => {
    logger.info('Playlist-Hero listening on 8044!');
});

app.stop = () => {
    //TODO: destroyer?
    server.close();
};
