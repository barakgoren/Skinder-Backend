const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ResortModel, validateResort } = require('../models/ResortModel');


// --------------------------- GETS ---------------------------

// Get all resorts
router.get('/', async (req, res) => {
    try {
        const resorts = await ResortModel.find();
        return res.json(resorts);
    } catch (error) {
        console.error('Error getting resorts:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});


// --------------------------- POSTS ---------------------------


// --------------------------- PATCHS ---------------------------


module.exports = router;