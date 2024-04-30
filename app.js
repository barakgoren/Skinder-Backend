const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;

// Routers
const userRouter = require('./routes/userRouter');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


//Routs
app.use('/users', userRouter);
// Default Route
app.get('/', (req, res) => {res.send('SkinderApp API by Barak Goren')});
// 404 Route
app.use('*', (req, res) => {res.status(404).send('Rout Not Found')});

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

