const express = require("express")

var app = express()
var router = express.Router()

// predicate the router with a check and bail out when needed
router.use(function(req, res, next) {
  if (!req.headers["x-auth"]) return next("router")
})

router.get("/", function(req, res) {
  res.send("hello, user!")
})

// use the router and 401 anything falling through
app.use("/admina", router, function(req, res) {
  res.sendStatus(401)
})

app.use("/", router)

app.listen(5000)
