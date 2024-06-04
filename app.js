const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;
const fileUpload = require('express-fileupload');
const path = require('path');

// Routers
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const { task } = require('./models/Instructor')

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(fileUpload({ fileSize: 5 * 1024 * 1024 }));
app.use(express.static(path.join(__dirname, 'public')));
// TODO : Testing Monday
task.start();



//Routs
app.use('/users', userRouter);
app.use('/reviews', reviewRouter);
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

