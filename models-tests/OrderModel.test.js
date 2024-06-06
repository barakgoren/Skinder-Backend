const mongoose = require('mongoose');
const { OrderModel, validateOrder } = require('../models/OrderModel');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

describe('Order Model Test', () => {

    // It's just so easy to connect to the MongoDB Memory Server 
    // By using mongoose.connect
    beforeAll(async () => {
        await mongod.start();
        const uri = await mongod.getUri();
        await mongoose.connect(uri);

    });

    // afterEach(async () => {
    //     await mongoose.connection.dropDatabase();
    // });

    test('Check MongoDB Connection', async () => {
        const isConnected = mongoose.connection.readyState;
        expect(isConnected).toBe(1);
    });

    // Testing procedure here
    test('create & save order successfully', async () => {
        const validOrder = new OrderModel({
            date: new Date(),
            client: new mongoose.Types.ObjectId(),
            instructor: new mongoose.Types.ObjectId(),
            location: [32.0844, 34.7818],
            isApproved: false
        });
        const savedOrder = await validOrder.save();

        console.log(savedOrder);
        // Object Id should be defined when successfully saved to MongoDB.
        expect(savedOrder._id).toBeDefined();
        expect(savedOrder.date).toBe(validOrder.date);
        expect(savedOrder.client).toBe(validOrder.client);
        expect(savedOrder.instructor).toBe(validOrder.instructor);
        expect(savedOrder.location).toStrictEqual(validOrder.location);
        expect(savedOrder.isApproved).toBe(validOrder.isApproved);
    });

    test('create order with invalid data should fail Joi validation', async () => {
        // Create an order with invalid data
        const invalidOrderData = {
            date: 'invalid date', // Invalid date
            client: 'invalid client id', // Invalid client id
            instructor: 'invalid instructor id', // Invalid instructor id
            // Add more fields here if needed
        };
    
        // Validate the data using Joi
        const validation = validateOrder(invalidOrderData);
    
        // Assert an error was returned
        expect(validation.error).toBeDefined();
        expect(validation.error.details[0].message).toContain('date must be a date');

        invalidOrderData.date = new Date(); // Valid date

        const validation1 = validateOrder(invalidOrderData);
        expect(validation1.error.details[0].message).toContain('location is required');

        invalidOrderData.location = [32.0844]; // Invalid location

        const validation2 = validateOrder(invalidOrderData);

        expect(validation2.error).toBeDefined();
        expect(validation2.error.details[0].message).toContain('location must have exactly 2 numbers');

        invalidOrderData.location = [32.0844, 34.7818]; // Valid location
        const validation3 = validateOrder(invalidOrderData);

        expect(validation3.error).toBeUndefined();
    });

    // More tests...

    // It's handy to be able to run queries on the database after tests. 
    // You can clear down the database after each test if needed.
    // afterEach(async () => {
    //     await Order.deleteMany();
    // });

    // Disconnect Mongoose
    afterAll(async () => {
        await mongoose.connection.close();
        expect(mongoose.connection.readyState).toBe(0);
    });
});