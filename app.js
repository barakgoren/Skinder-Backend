const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;
const fileUpload = require('express-fileupload');
const path = require('path');

// Models
const { Instructor } = require('./models/Instructor');
const { OrderModel } = require('./models/OrderModel');

// Routers
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const orderRouter = require('./routes/orderRouter');
const resortsRouter = require('./routes/resortsRouter');
const locationRouter = require('./routes/locationRouter');
const { task } = require('./models/Instructor');


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(fileUpload({ fileSize: 5 * 1024 * 1024 }));
app.use(express.static(path.join(__dirname, 'public')));
task.start();



//Routs
app.use('/users', userRouter);
app.use('/reviews', reviewRouter);
app.use('/orders', orderRouter);
app.use('/resorts', resortsRouter);
app.use('/locations', locationRouter);
app.get('/summary', async(req, res) => {
  // TODO : app.js - create route for summary widgets
  try {
    // Get all instructors
    const instructors = await Instructor.find();
    // Get all orders
    const orders = await OrderModel.find().populate('instructor');

    let totalSnowboardInstructors = instructors.filter(instructor => instructor.type === 'Snowboard').length;
    let totalSkiInstructors = instructors.filter(instructor => instructor.type === 'Ski').length;
    let totalOrders = orders.length;
    let ordersMadeToday = orders.filter(order => new Date(order.dateCreated).toDateString() === new Date().toDateString());
    let totalTransactions = ordersMadeToday.reduce((acc, order) => acc + (order.instructor.price * order.date.length), 0);
    let summary = {
      instructors: {
        Snowboard: totalSnowboardInstructors,
        Ski: totalSkiInstructors
      },
      orders: totalOrders,
      transactions: totalTransactions
    };
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error getting summary:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Default Route
app.get('/', (req, res) => { res.send('SkinderApp API by Barak Goren') });
// 404 Route
app.use('*', (req, res) => { res.status(404).send('Rout Not Found') });

mongoose.connect('mongodb://localhost:27017/SkinderApp')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

