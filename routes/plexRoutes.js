const express = require('express');
const router = express.Router();
const plexController = require('../controllers/plexController');

router.get('/shows', plexController.getPlexShows);

module.exports = router;
