const express = require("express")
const { check } = require("express-validator")
const router = express.Router()
const placesControllers = require("../controllesrs/places-controllers")

router.get("/:plcId", placesControllers.getPlaceById)

router.get("/user/:uid", placesControllers.getPlacesByUserId)

router.post(
  "/",
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address")
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
)

router.patch(
  "/:plcId",
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 })
  ],
  placesControllers.updatePlaceById
)

router.delete("/:plcId", placesControllers.deletePlaceById)

module.exports = router
