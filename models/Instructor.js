const express = require('express');
const mongoose = require('mongoose');
const { UserModel, validateUser, getValidationSchema } = require('./UserModel');
const Joi = require('joi');

const instructorSchema = mongoose.Schema({
    type: {type: String, required: true},
    skillLevel: {type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced']},
    rating: {type: Array, ref: 'Review'},
    operatingStartHour: {type: String, required: true},
    operatingEndHour: {type: String, required: true},
    minAge: {type: Number, default: 10},
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
        minAge: Joi.number().min(10),
        price: Joi.number().required(),
        rating: Joi.array()
    });
    const combinedSchema = baseUserSchema.concat(joiSchema);
    return combinedSchema.validate(_bodyData);
}

exports.validateInstructor = validateInstructor;
exports.Instructor = Instructor;