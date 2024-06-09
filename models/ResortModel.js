const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const resortSchema = mongoose.Schema({
    resortCode: {
        type: String,
        required: true
    },
    resortName: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    },
    resortImageUrl: {
        type: String,
        required: true
    },
    resortDescription: {
        type: String,
        required: true
    },
    resortAlltitude: {
        type: String,
        required: true
    },
    resortPisteLength: {
        type: String,
        required: true
    },
    resortLifts: {
        type: String,
        required: true
    },
    resortSlopes: {
        type: String,
        required: true
    },
    resortDifficulty: {
        type: String,
        required: true
    },
    resortSnowParks: {
        type: String,
        required: true
    },
})

const ResortModel = mongoose.model('Resort', resortSchema);

const validateResort = (_bodyData) => {
    let joiSchema = Joi.object({
        resortCode: Joi.string().required(),
        resortName: Joi.string().required(),
        countryCode: Joi.string().required(),
        resortImageUrl: Joi.string().required(),
        resortDescription: Joi.string().required(),
        resortAlltitude: Joi.string().required(),
        resortPisteLength: Joi.string().required(),
        resortLifts: Joi.string().required(),
        resortSlopes: Joi.string().required(),
        resortDifficulty: Joi.string().required(),
        resortSnowParks: Joi.string().required(),
    });
    return joiSchema.validate(_bodyData);
}

exports.ResortModel = ResortModel;
exports.validateResort = validateResort;


