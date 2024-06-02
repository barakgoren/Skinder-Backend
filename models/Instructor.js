const express = require('express');
const mongoose = require('mongoose');
const { UserModel, validateUser, getValidationSchema } = require('./UserModel');
const { dateSchema } = require('./HourModel');
const Joi = require('joi');
const cron = require('node-cron');

const instructorSchema = mongoose.Schema({
    type: { type: String, required: true },
    skillLevel: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    rating: { type: Array, ref: 'Review' },
    availableHours: { type: [dateSchema], default: [] },
    operatingStartHour: { type: String, required: true },
    operatingEndHour: { type: String, required: true },
    minAge: { type: Number, default: 10 },
    price: { type: Number, required: true },
});

const validateInstructor = (_bodyData) => {
    let baseUserSchema = getValidationSchema();
    let joiSchema = Joi.object({
        type: Joi.string().required(),
        skillLevel: Joi.string().required(),
        operatingStartHour: Joi.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        operatingEndHour: Joi.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        minAge: Joi.number().min(10),
        price: Joi.number().required(),
        rating: Joi.array(),
        availableHours: Joi.array(),
    });
    const combinedSchema = baseUserSchema.concat(joiSchema);
    return combinedSchema.validate(_bodyData);
}

const initializeHours = (instructor) => {
    if (!instructor.operatingStartHour || !instructor.operatingEndHour) {
        throw new Error('operatingStartHour and operatingEndHour must be defined');
    }
    console.log('Initializing hours');
    let availableDates = [];
    let currentDate = new Date();

    // Loop over the next 14 days
    for (let i = 0; i < 14; i++) {
        let date = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + i));
        let startHour = parseInt(instructor.operatingStartHour.split(':')[0]);
        let endHour = parseInt(instructor.operatingEndHour.split(':')[0]);
        let hoursAvailable = [];

        // For each hour between operatingStartHour and operatingEndHour, create a new hourSchema subdocument
        for (let j = startHour; j < endHour; j++) {
            let hourDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), j));
            hoursAvailable.push({ date: hourDate, isAvailable: true });
        }

        // Add the hours to the hoursAvailable array for this date
        availableDates.push({ date: date, hoursAvailable: hoursAvailable });
    }

    // Add the availableDates to the availableHours array
    instructor.availableHours.push(...availableDates);
}

const updateAvailability = async () => {
    let currentHour = new Date().getHours();
    let formattedCurrentHour = currentHour < 10 ? `0${currentHour}:00` : `${currentHour}:00`;
    console.log('Updating availability ' + formattedCurrentHour);
    try {
        // Get all instructors
        const instructors = await Instructor.find();

        // For each instructor
        for (let instructor of instructors) {
            // Remove past hours
            let notNotUTC = new Date();
            let now = new Date(notNotUTC.toISOString());

            for (let date of instructor.availableHours) {
                date.hoursAvailable = date.hoursAvailable.filter(hour => {
                    const hourDate = new Date(hour.date);
                    return hourDate >= now;
                });
                // If the date has no more hours available, remove it, and add a new date 14 days in the future
                if (date.hoursAvailable.length === 0) {
                    console.log("Date Outdated: " + date.date + " - Adding new date 14 days in the future");
                    instructor.availableHours = instructor.availableHours.filter(d => d.date !== date.date);
                    let newDate = new Date(date.date);
                    newDate.setDate(newDate.getDate() + 14);
                    let startHour = parseInt(instructor.operatingStartHour.split(':')[0]);
                    let endHour = parseInt(instructor.operatingEndHour.split(':')[0]);
                    let hoursAvailable = [];
                    for (let j = startHour; j < endHour; j++) {
                        let hourDate = new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), j));
                        hoursAvailable.push({ date: hourDate, isAvailable: true });
                    }
                    instructor.availableHours.push({ date: newDate, hoursAvailable: hoursAvailable });
                }
            }

            // Save the updated instructor
            await instructor.save();
        }
    } catch (error) {
        console.error('Error updating availability:', error);
    }
};

const task = cron.schedule('* * * * *', updateAvailability);


// Use initializeHours as a pre save middleware
instructorSchema.pre('save', function (next) {
    // Only initialize hours if the document is new
    if (this.isNew) {
        initializeHours(this);
    }
    next();
});

const Instructor = UserModel.discriminator('Instructor', instructorSchema);

exports.validateInstructor = validateInstructor;
exports.Instructor = Instructor;
exports.task = task;