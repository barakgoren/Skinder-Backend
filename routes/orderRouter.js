const express = require('express');
const router = express.Router();
const { OrderModel, validateOrder } = require('../models/OrderModel');
const { instructor, Instructor } = require('../models/Instructor');
const { isAuth } = require('../utils/auth');

// --------------------------- GETS ---------------------------

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await OrderModel.find().populate('client').populate('location').populate('instructor');
        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get user's unapproved orders
router.get('/unapproved', isAuth, async (req, res) => {
    try {
        const orders = await OrderModel.find({ isApproved: false, instructor: req.userId }).populate('client').populate('location');
        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error getting unapproved orders:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});


// --------------------------- POSTS ---------------------------

// Create a new order
router.post('/', async (req, res) => {
    try {
        let { error } = validateOrder(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        let order = new OrderModel(req.body);
        await order.save();
        return res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// --------------------------- PATCHES ---------------------------

// Approve an order by id
router.patch('/approve/:id', async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        order.isApproved = true;
        await order.save();

        // Set the hours in the instructor's schedule unavailable
        const instructor = await Instructor.findById(order.instructor);
        instructor.availableHours.forEach(date => {
            if (date.hoursAvailable.length > 0) {
                date.hoursAvailable.forEach(hour => {
                    const orderDates = order.date.map(d => new Date(d).toISOString());
                    const hourDateIso = new Date(hour.date).toISOString();
                    if (orderDates.includes(hourDateIso)) {
                        hour.isAvailable = false;
                    }
                });
            }
        });
        await instructor.save();
        return res.status(200).json(order);
    } catch (error) {
        console.error('Error approving order:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});


// Router 404
router.use('*', (req, res) => {
    res.status(404).send({ msg: 'Rout Not Found' });
});

module.exports = router;

