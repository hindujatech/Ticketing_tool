var express = require('express')

var router = express.Router()

// Getting the User Controller that we just created

var WebServiceController = require('../controllers/webservices.controller');

// Map each API to the Controller FUnctions

router.post('/getSelectedEmployeeList/', WebServiceController.getSelectedEmployeeList);

router.get('/getFliteredEmployeeList/:filtered_value', WebServiceController.getFliteredEmployeeList);

router.get('/login/:username/:password', WebServiceController.login);
router.get('/getReporteeList/:manager_id', WebServiceController.getReporteeList);
router.get('/geRRFCreationDetail/', WebServiceController.geRRFCreationDetail);
// Export the Router
module.exports = router;