//for mail
const nodemailer = require('nodemailer');
var ConfigurationValue = require('../../models/configuration_values.model');
var mail_configuration = '';
ConfigurationValue.aggregate([
    {
        $match: {
            "key": "Ticketing_toolmail",
            "deleted": false
        }
    },
    {
        $project: {
            "_id": 0,
            "mail_detail": "$value"
        }
    }
]
    , function (err, mail_detail) {
        //console.log(mail_detail);
        if (err) {
            console.log("Something wrong when updating data!");
        }
        module.exports.mail_configuration = nodemailer.createTransport({
            host: 'smtp.live.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: mail_detail[0]["mail_detail"][0], // generated ethereal user
                pass: mail_detail[0]["mail_detail"][1] // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
);


