const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.plcId;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('kapa ziomek 1', 404);
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError('Fetching places failed, try again later', 404);
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    throw next(new HttpError('kapa ziomek 2', 404));
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid data', 422));
  }

  const { title, description, coordinates, address, creator, image } = req.body;

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for peovided id', 404);
    return next(error);
  }

  console.log(user);

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: 'Invalid data2' });
    return next(new HttpError('Invalid data2', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.plcId;

  try {
    place = await Place.findByIdAndUpdate(placeId, {
      title: title,
      description: description
    });
  } catch (err) {
    const error = new HttpError('Something went wrong!!!', 500);
    return next(error);
  }

  res.status(200).json({ place: place });
};

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.plcId;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
    console.log(place);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place',
      500
    );
    return next(err);
  }

  if (!place) {
    const error = new HttpError('Could not find place fo this id', 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted place', place: place });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
