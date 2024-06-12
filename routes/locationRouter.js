const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { LocationModel, validateLocation } = require('../models/LocationModel');


// --------------------------- GETS ---------------------------

// Get all locations
router.get('/', async (req, res) => {
    try {
        const locations = await LocationModel.find();
        if (!locations.length) {
            return res.status(404).send('No locations found');
        }
        return res.json(locations);
    } catch (error) {
        console.error('Error getting locations:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get all locations from a resort
router.get('/:resortCode', async (req, res) => {
    console.log('get all locations');
    console.log(req.params.resortCode);
    const resortCode = req.params.resortCode;
    if (!resortCode) {
        return res.status(400).send('Missing resort code');
    }
    try {
        const locations = await LocationModel.find({ resortCode });
        if (!locations.length) {
            return res.status(404).send('No locations found');
        }
        return res.json(locations);
    } catch (error) {
        console.error('Error getting locations:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});


// --------------------------- POSTS ---------------------------


// --------------------------- PATCHS ---------------------------


module.exports = router;