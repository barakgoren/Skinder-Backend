const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const reviewSchema = mongoose.Schema({
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
})

const ReviewModel = mongoose.model('Review', reviewSchema);

const validateReview = (_bodyData) => {
    let joiSchema = Joi.object({
        author: Joi.string().required(),
        target: Joi.string().required(),
        title: Joi.string().min(2).max(50).required(),
        content: Joi.string().min(2).required(),
        rating: Joi.number().min(1).max(5).required(),
    });
    return joiSchema.validate(_bodyData);
}

exports.ReviewModel = ReviewModel;
exports.validateReview = validateReview;


