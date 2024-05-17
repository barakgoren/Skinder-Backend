const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const hourSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
})

const validateHour = (_bodyData) => {
    let joiSchema = Joi.object({
        date: Joi.date().required(),
        isAvailable: Joi.boolean(),
        client: Joi.string()
    });
    return joiSchema.validate(_bodyData);
}

exports.validateHour = validateHour;
exports.hourSchema = hourSchema;


