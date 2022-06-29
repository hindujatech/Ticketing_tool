var express = require('express')

var router = express.Router()

// Getting the User Controller that we just created

var UserController = require('../controllers/users.controller');

// Map each API to the Controller FUnctions

router.post('/authenticateUser',  UserController.userauthenticateUser)

// Export the Router
module.exports = router;