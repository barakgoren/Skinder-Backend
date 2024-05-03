const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { UserModel, validateUser } = require('../models/UserModel');
const { genToken } = require('../utils/auth');
const { Instructor, validateInstructor } = require('../models/Instructor');

// --------------------------- GETS ---------------------------

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await UserModel.find();
        if (!users.length) {
            return res.status(404).send('No users found');
        }
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get all instructors withour personal details
router.get('/instructors', async (req, res) => {
    try {
        const instructors = await Instructor.find({}, { password: 0, role: 0 });
        if (!instructors.length) {
            return res.status(404).send('No instructors found');
        }
        return res.json(instructors);
    } catch (error) {
        console.error('Error getting instructors:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// --------------------------- POSTS ---------------------------


// Create a new user
router.post('/', async (req, res) => {
    try {
        // Hash the password
        req.body.password = await bcrypt.hash(req.body.password, 10);

        if (req.body.role && req.body.role.includes("Instructor")) {
            const validInstructor = validateInstructor(req.body);
            if (validInstructor.error) {
                return res.status(400).send(validInstructor.error.details);
            }
            let instructor = new Instructor(req.body);
            instructor = await instructor.save();
            return res.status(201).json(instructor);
        }

        // Validate the request body
        const validBody = validateUser(req.body);
        if (validBody.error) {
            return res.status(400).send(validBody.error.details);
        }

        // Create the user
        let user = new UserModel(req.body);
        user = await user.save();

        return res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        // Validate the request body
        if (!req.body.username || !req.body.password) {
            return res.status(400).send('Username and password are required');
        }
        // Find the user
        const user = await UserModel.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).send('User not found');
        } else {
            // Check the password
            let isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return res.status(401).send('Invalid password');
            }
        }
        // Generate a token
        const token = genToken(user._id);
        return res.status(200).json({ token, user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;