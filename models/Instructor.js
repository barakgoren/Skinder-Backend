const express = require('express');
const mongoose = require('mongoose');
const { UserModel, validateUser, getValidationSchema } = require('./UserModel');
const Joi = require('joi');

const instructorSchema = mongoose.Schema({
    type: {type: String, required: true},
    skillLevel: {type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced']},
    rating: {type: Number, default: 0},
    operatingStartHour: {type: String, required: true},
    operatingEndHour: {type: String, required: true},
    price: {type: Number, required: true},
});

const Instructor = UserModel.discriminator('Instructor', instructorSchema);

const validateInstructor = (_bodyData) => {
    let baseUserSchema = getValidationSchema();
    let joiSchema = Joi.object({
        type: Joi.string().required(),
        skillLevel: Joi.string().required(),
        operatingStartHour: Joi.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        operatingEndHour: Joi.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        price: Joi.number().required(),
        rating: Joi.number()
    });
    const combinedSchema = baseUserSchema.concat(joiSchema);
    return combinedSchema.validate(_bodyData);
}

exports.validateInstructor = validateInstructor;
exports.Instructor = Instructor;