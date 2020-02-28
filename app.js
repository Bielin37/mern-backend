const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Request-Width, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/', placesRoutes);
app.use('/', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Kapa ziomek 3');
  res.json({ message: error }).status(404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(
    'mongodb+srv://Bielin37:Adisiowy@cluster0-nnkvf.mongodb.net/places?retryWrites=true&w=majority'
  )
  .then(() => {
    app.listen(5000, () => {
      console.log('Server is running on port 5000, and connected to DB ');
    });
  })
  .catch(err => {
    console.log(err);
  });
