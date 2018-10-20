'use strict';

const express = require('express');
const router = express.Router();

const Client = require('./client');
const Playlist = require('./youtube/playlist');
const Subs = require('./youtube/subs');
const Logger = require('./util/logger');

const youtubeScope = ["https://www.googleapis.com/auth/youtube"];//[global.config.scopes.youtube];

router.use((req, res, next) => {
    Logger.debug(`${req.method} for ${req.url}`);
    next();
});

router.get('/sampleVids', (req, res) => {
    Client
        .authenticate(youtubeScope)
        .then(async () => {
            Logger.debug('authenticated - in then');
            const result = await Playlist.getVideos('PL1RQwuELCxoycdSERU3sdsEJYNINaiZTO');
            res.json(result);
        })
        .catch(error => Logger.error(error));
});

router.get('/sampleData', (req, res) => {
    Client
        .authenticate(youtubeScope)
        .then(async () => {
            Logger.debug('authenticated');
            const result = await Playlist.getData('PL1RQwuELCxoycdSERU3sdsEJYNINaiZTO');
            res.json(result);
        })
        .catch(error => Logger.error(error));
});

router.get('/pl', (req, res) => {
    const playlistId = req.query.id;
    const info = req.query.info;
    Client
        .authenticate(youtubeScope)
        .then(async () => {
            Logger.debug('authenticated');
            const result = await info ? Playlist.getData(playlistId) : Playlist.getVideos(playlistId);
            res.json(result);
        })
        .catch(error => Logger.error(error));
});

router.get('/subs', (req, res) => {
    Client
        .authenticate(youtubeScope)
        .then(async () => {
            const result = await Subs.getOwnSubscriptions();
            res.json(result);
        })
        .catch(error => Logger.error(error));
});

module.exports = router;