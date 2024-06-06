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
        type: [Number],
    },
    isApproved: {
        type: Boolean,
        default: false
    },
})

const validateOrder = (_bodyData) => {
    let joiSchema = Joi.object({
        date: Joi.date().required().messages({
            'date.base': 'date must be a date',
            'any.required': 'date is required'
        }),
        client: Joi.string().required(),
        instructor: Joi.string().required(),
        location: Joi.array().items(Joi.number()).length(2).required().messages({
            'array.base': 'location must be an array',
            'array.length': 'location must have exactly 2 numbers',
            'any.required': 'location is required'
        }),
        isApproved: Joi.boolean()
    });
    return joiSchema.validate(_bodyData);
}

const OrderModel = mongoose.model('Order', orderSchema);

exports.validateOrder = validateOrder;
exports.OrderModel = OrderModel;


