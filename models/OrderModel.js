const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const orderSchema = mongoose.Schema({
    dateCreated: {
        type: Date,
        required: true
    },
    date: {
        type: [Date],
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
    },
    isApproved: {
        type: Boolean,
        default: false
    },
})

const validateOrder = (_bodyData) => {
    let joiSchema = Joi.object({
        dateCreated: Joi.date().required(),
        date: Joi.array().items(Joi.date()).required().messages({
            'array.base': 'date must be an array',
            'any.required': 'date is required'
        }),
        client: Joi.string().required(),
        instructor: Joi.string().required(),
        location: Joi.string(),
        isApproved: Joi.boolean()
    });
    return joiSchema.validate(_bodyData);
}

const OrderModel = mongoose.model('Order', orderSchema);

exports.validateOrder = validateOrder;
exports.OrderModel = OrderModel;


