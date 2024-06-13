const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { LocationModel, validateLocation } = require('../models/LocationModel');


// --------------------------- GETS ---------------------------

// Get all locations
router.get('/', async (req, res) => {
    try {
        const locations = await LocationModel.find().populate('resortId');
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

// Update location description
router.patch('/:id', async (req, res) => {
    const locationId = req.params.id;
    if (!locationId) {
        return res.status(400).send('Missing location id');
    }
    try {
        const location = await LocationModel.findById(locationId);
        if (!location) {
            return res.status(404).send({ msg: 'Location not found' });
        }
        location.locationDescription = req.body.locationDescription;
        await location.save();
        return res.json(location);
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Update location name
router.patch('/name/:id', async (req, res) => {
    const locationId = req.params.id;
    if (!locationId) {
        return res.status(400).send('Missing location id');
    }
    try {
        const location = await LocationModel.findById(locationId);
        if (!location) {
            return res.status(404).send({ msg: 'Location not found' });
        }
        location.locationName = req.body.locationName;
        await location.save();
        return res.json(location);
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});


module.exports = router;