const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ResortModel, validateResort } = require('../models/ResortModel');
const { Instructor } = require('../models/Instructor');


// --------------------------- GETS ---------------------------

// Get all resorts
router.get('/', async (req, res) => {
    try {
        const resorts = await ResortModel.find();
        // Adding instructors to the resorts
        const resortsWithInstructors = await Promise.all(resorts.map(async (resort) => {
            const instructors = await Instructor.find({ resortId: resort._id });
            return { ...resort.toObject(), instructors };
        }));
        return res.json(resortsWithInstructors);
    } catch (error) {
        console.error('Error getting resorts:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get resort by ID
router.get('/:id', async (req, res) => {
    try {
        const resort = await ResortModel.findById(req.params.id);
        if (!resort) {
            return res.status(404).send({msg: 'Resort not found'});
        }
        return res.status(200).json(resort);
    } catch (error) {
        console.error('Error getting resort:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});


// --------------------------- POSTS ---------------------------


// --------------------------- PATCHS ---------------------------


module.exports = router;