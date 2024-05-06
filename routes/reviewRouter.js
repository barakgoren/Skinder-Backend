const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ReviewModel, validateReview } = require('../models/ReviewModel');
const { UserModel } = require('../models/UserModel');


// --------------------------- GETS ---------------------------

// Get all reviews
router.get('/', async (req, res) => {
    console.log('get all reviews');
    try {
        const reviews = await ReviewModel.find();
        if (!reviews.length) {
            return res.status(404).send('No reviews found');
        }
        return res.json(reviews);
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get reviews of target user
router.get('/targeted/:id', async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).send('Missing target user ID');
    }
    try {
        const reviews = await ReviewModel.find({ target: userId });
        if (!reviews.length) {
            return res.status(404).send('No reviews found');
        }
        return res.json(reviews);
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// --------------------------- POSTS ---------------------------

// Create a new review
router.post('/', async (req, res) => {
    try {
        let { error } = validateReview(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        let review = new ReviewModel(req.body);
        await review.save();
        return res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// --------------------------- PATCHS ---------------------------


module.exports = router;