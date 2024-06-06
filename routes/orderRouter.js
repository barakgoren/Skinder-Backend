const express = require('express');
const router = express.Router();
const { OrderModel, validateOrder } = require('../models/OrderModel');
const { isAuth } = require('../utils/auth');

// --------------------------- GETS ---------------------------

// Get user's unapproved orders

router.get('/unapproved',isAuth, async (req, res) => {
    try {
        const orders = await OrderModel.find({ isApproved: false, instructor: req.userId }).populate('client');
        return res.status(200).json(orders);
        // return res.json(orders);
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


module.exports = router;

