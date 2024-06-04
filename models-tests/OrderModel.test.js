const mongoose = require('mongoose');
const Order = require('../models/OrderModel');

describe('Order Model Test', () => {

    // It's just so easy to connect to the MongoDB Memory Server 
    // By using mongoose.connect
    beforeAll(async () => {
        await mongoose.connect(global.__MONGO_URI__, 
        { useNewUrlParser: true, useCreateIndex: true }, 
        (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });

    // Testing procedure here
    test('create & save order successfully', async () => {
        // Your test code here
    });

    // More tests...

    // It's handy to be able to run queries on the database after tests. 
    // You can clear down the database after each test if needed.
    afterEach(async () => {
        await Order.deleteMany();
    });

    // Disconnect Mongoose
    afterAll(async () => {
        await mongoose.connection.close();
    });
});