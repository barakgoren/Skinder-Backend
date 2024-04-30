const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    role: {
        type: Array,
        default: ["User"]
    },
    password: {
        type: String,
        required: true
    }
})

const validateUser = (_bodyData) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).required(),
        username: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9._]+$')) // Allows '.', '_'
            .min(2)
            .max(30)
            .required(),
        email: Joi.string().email().required(),
        dateOfBirth: Joi.date().required(),
        password: Joi.string().required()
    });
    return joiSchema.validate(_bodyData);
}

const UserModel = mongoose.model('User', userSchema);

exports.UserModel = UserModel;
exports.validateUser = validateUser;