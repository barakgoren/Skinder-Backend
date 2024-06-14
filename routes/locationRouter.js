const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { LocationModel, validLocation } = require('../models/LocationModel');
const { ResortModel } = require('../models/ResortModel');


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

// Create new location
router.post('/', async (req, res) => {
    // Find the referent resort
    try {
        const resort = await ResortModel.findById(req.body.resortId);
        // Creating an object of location
        const location = {
            resortCode: resort.resortCode,
            countryCode: resort.countryCode,
            resortName: resort.resortName,
            locationName: req.body.locationName,
            locationCoords: [req.body.locationCoords.lat, req.body.locationCoords.lng],
            locationDescription: req.body.locationDescription,
            resortId: req.body.resortId
        };
        const { error } = validLocation(location);
        if (error) {
            console.error('Error validating location:', error);
        }
        const newLocation = new LocationModel(location);
        await newLocation.save();
        return res.json(newLocation);
    } catch (error) {
        console.error('Error creating location:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});


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