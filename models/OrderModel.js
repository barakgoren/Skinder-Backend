const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const orderSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
        required: true
    },
    location: {
        type: [Float],
    },
    isApproved: {
        type: Boolean,
        default: false
    },
})

// TODO : Continue from here


const validateOrder = (_bodyData) => {
    let joiSchema = Joi.object({
        date: Joi.date().required(),
        client: Joi.string().required(),
        instructor: Joi.string().required(),
        location: Joi.string(),
        isApproved: Joi.boolean()
    });
    return joiSchema.validate(_bodyData);
}

exports.validateHour = validateHour;


