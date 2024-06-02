const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { UserModel, validateUser } = require('../models/UserModel');
const { genToken, isAuth } = require('../utils/auth');
const { Instructor, validateInstructor } = require('../models/Instructor');
const { uploadSingle } = require('../utils/uploadHandler');
const path = require("path");

// --------------------------- GETS ---------------------------

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await UserModel.find().populate('rating').populate('saved');
        if (!users.length) {
            return res.status(404).send('No users found');
        }
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get all instructors withouא personal details
router.get('/instructors', async (req, res) => {
    try {
        const instructors = await Instructor.find({}, { password: 0, role: 0 }).populate('rating').populate('saved');
        if (!instructors.length) {
            return res.status(404).send('No instructors found');
        }
        return res.json(instructors);
    } catch (error) {
        console.error('Error getting instructors:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get user by a Bearer token
router.get('/me',isAuth, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId, { password: 0 }).populate('rating').populate('saved');
        if (!user) {
            return res.status(404).send('User not found');
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id, { password: 0 }).populate('rating').populate('saved');
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

        // Upload profile picture
        if (req.files && req.files.profilePic) {
            req.files.profilePic.name = (req.body.username + '_profile' + path.extname(req.files.profilePic.name)).toLocaleLowerCase();
            req.body.profilePic = req.files.profilePic.name;
            uploadSingle(req, 'profilePic', '').catch((error) => {
                console.error('Error uploading profile picture:', error);
                return res.status(500).json({ message: 'Internal server error', error });
            });
        } else {
            req.body.profilePic = 'default.jpg';
        }

        if (req.body.role && req.body.role === "Instructor") {
            req.body.role = ["Instructor"];
            req.body.rating = [];
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
        if (error.code === 11000) {
            return res.status(409).send('Username or email already exists');
        }
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
        const user = await UserModel.findOne({ username: req.body.username }).populate('rating').populate('saved');
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

// --------------------------- PATCHS ---------------------------

// Edit rating of instructor
router.patch('/:id', async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            return res.status(404).send('Instructor not found');
        }
        req.body.rating = parseInt(req.body.rating);
        instructor.rating.push(req.body.rating);
        await instructor.save();
        return res.json(instructor);
    } catch (error) {
        console.error('Error updating instructor:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

// Adding document to saved array
router.patch('/save/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).populate('saved').populate('rating');
        req.body.saved = await UserModel.findById(req.body.saved).populate('rating').populate('saved');
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.saved.push(req.body.saved);
        await user.save();
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error saving document:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

// Remove document from saved array
router.patch('/unsave/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).populate('saved').populate('rating');
        req.body.saved = await UserModel.findById(req.body.saved).populate('rating').populate('saved');
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.saved = user.saved.filter((saved) => saved._id == req.body.saved._id);
        await user.save();
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error unsaving document:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

// --------------------------- DELETES ---------------------------


module.exports = router;