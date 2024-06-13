const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const locationSchema = mongoose.Schema({
    resortCode: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    },
    resortName: {
        type: String,
        required: true
    },
    locationName: {
        type: String,
        required: true
    },
    locationDescription: {
        type: String,
        required: true
    },
    locationCoords: {
        type: [Number],
        required: true
    },
    resortId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resort',
        required: true
    }

})

const LocationModel = mongoose.model('Location', locationSchema);

const validLocation = (_bodyData) => {
    let joiSchema = Joi.object({
        resortCode: Joi.string().required(),
        countryCode: Joi.string().required(),
        resortName: Joi.string().required(),
        resortDescription: Joi.string().required(),
        locationName: Joi.string().required(),
        locationCoords: Joi.array().items(Joi.number()).length(2).required().messages({
            'array.base': 'location must be an array',
            'array.length': 'location must have exactly 2 numbers',
            'any.required': 'location is required'
        }),
        resortId: Joi.string().required()
    });
    return joiSchema.validate(_bodyData);
}

exports.LocationModel = LocationModel;
exports.validLocation = validLocation;


