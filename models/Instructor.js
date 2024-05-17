const express = require('express');
const mongoose = require('mongoose');
const { UserModel, validateUser, getValidationSchema } = require('./UserModel');
const { hourSchema } = require('./HourModel');
const Joi = require('joi');
const cron = require('node-cron');

const instructorSchema = mongoose.Schema({
    type: { type: String, required: true },
    skillLevel: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    rating: { type: Array, ref: 'Review' },
    availableHours: { type: [hourSchema], default: [] },
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
    let hours = [];
    let currentDate = new Date();

    // Loop over the next 14 days
    for (let i = 0; i < 14; i++) {
        let date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + i);
        let startHour = parseInt(instructor.operatingStartHour.split(':')[0]);
        let endHour = parseInt(instructor.operatingEndHour.split(':')[0]);

        // For each hour between operatingStartHour and operatingEndHour, create a new hourSchema subdocument
        for (let j = startHour; j < endHour; j++) {
            let hourDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), j));
            hours.push({ date: hourDate, isAvailable: true });
        }
    }

    // Add the hours to the availableHours array
    instructor.availableHours.push(...hours);
}

const updateAvailability = async () => {
    console.log('Updating availability');
    try {
        // Get all instructors
        const instructors = await Instructor.find();

        // For each instructor
        for (let instructor of instructors) {
            // Remove past hours
            const now = new Date();
            instructor.availableHours = instructor.availableHours.filter(hour => hour.date > now);

            // Calculate the end date of the availability window
            let endDate = new Date();
            endDate.setDate(endDate.getDate() + 14);

            // Find the last available hour
            let lastHour = new Date(Math.max(...instructor.availableHours.map(hour => hour.date)));

            // If the last available hour is before the end date
            if (lastHour < endDate) {
                // Add hours until the end date
                let hourToAdd = new Date(lastHour);
                hourToAdd.setHours(hourToAdd.getHours() + 1);

                while (hourToAdd < endDate) {
                    // Only add hours within the operating hours
                    if (hourToAdd.getHours() >= instructor.operatingStartHour && hourToAdd.getHours() < instructor.operatingEndHour) {
                        instructor.availableHours.push({
                            date: new Date(hourToAdd),  // Create a new Date object to avoid reference issues
                            client: null,
                            isAvailable: true
                        });
                    }

                    hourToAdd.setHours(hourToAdd.getHours() + 1);
                }
            }

            // Save the updated instructor
            await instructor.save();
        }
        console.log('Availability updated');
    } catch (error) {
        console.error('Error updating availability:', error);
    }
};

const task = cron.schedule('0 * * * *', updateAvailability);


// Use initializeHours as a pre save middleware
instructorSchema.pre('save', function (next) {
    console.log('Pre save middleware');
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