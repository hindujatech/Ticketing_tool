const mail = require('../public/javascripts/mail');
var TicketMaster = require('../models/ticket_masters.model');
var ConfigurationValue = require('../models/configuration_values.model');
var UserDetail = require('../models/user_details.model');
ObjectId = require('mongoose').Types.ObjectId;

exports.sendmail =  function (object)  {
    console.log('you data',object)
    function saveToTheDb(value) {  
        return new Promise(function(resolve, reject) {
             ConfigurationValue.aggregate([
                {
                    $match: {
                        "key": "departments",
                        "deleted": false
                    }
                },
                {
                    $project: {
                        "_id": 0,
                        "departments": "$value"
                    }
                }
            ]);
          
        })
      }
    

   
}
