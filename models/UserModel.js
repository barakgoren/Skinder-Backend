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
    profilePic: {
        type: String,
        default: 'default.png'
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    saved: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
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
        phoneNumber: Joi.string().pattern(new RegExp('^[0-9]{10}$')),
        saved: Joi.array(),
        profilePic: Joi.string(),
        dateOfBirth: Joi.date().required(),
        password: Joi.string().required(),
        role: Joi.array().items(Joi.string())
    });
    return joiSchema.validate(_bodyData);
}

const getValidationSchema = () => {
    return joiSchema = Joi.object({
        name: Joi.string().min(2).required(),
        username: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9._]+$')) // Allows '.', '_'
            .min(2)
            .max(30)
            .required(),
        profilePic: Joi.string(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().pattern(new RegExp('^[0-9]{10}$')),
        saved: Joi.array(),
        dateOfBirth: Joi.date().required(),
        password: Joi.string().required(),
        role: Joi.array().items(Joi.string())
    });
}

const UserModel = mongoose.model('User', userSchema);

exports.UserModel = UserModel;
exports.validateUser = validateUser;
exports.getValidationSchema = getValidationSchema;