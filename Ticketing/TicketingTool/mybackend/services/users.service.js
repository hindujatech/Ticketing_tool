// Gettign the Newly created Mongoose Model we just created 
const jwt = require('jsonwebtoken');
const config = require('../config.json');
var ldapStrategy = require('ldapauth-fork');
var UserDetail = require('../models/user_details.model');
var ConfigurationValue = require('../models/configuration_values.model');
var TicketMaster = require('../models/ticket_masters.model');


let ldap = new ldapStrategy({
    url: 'ldap://htc-s-htpdc:389/',
    bindDn: "CN=TT Admin,OU=Common user,OU=Hinduja Tech User,DC=HINDUJA-TECH,DC=COM",
    bindCredentials: "Ticket@1",
    searchBase: "OU=Hinduja Tech User,DC=HINDUJA-TECH,DC=COM",
    searchFilter: "(sAMAccountName={{username}})",
    timeout: 500,
    connectTimeout: 100,
    reconnect: true

});
ldap.on('error', error => {
    ldap.close();
});
function authenticate(username, password) {
    return new Promise(function (resolve, reject) {
        ldap.authenticate(username, password, function (err, user) {
            console.log("user", user)
            if (err) reject(err);
            else if (!user) reject();
            else resolve(user);
        })
    });
}

exports.authenticateUser = async function ({ username, password }) {

    if (username && password) {
        var user_object = await UserDetail.findOne({ username: username }, { _id: 0, profile_picture_url: 1, location: 1, mobile_number: 1 });
        console.log("user_object", user_object);
        var profile_pic_url = '';
        //var mobile_number = '';
        //var location = '';
        if (user_object) {
            profile_pic_url = user_object.profile_picture_url;
          //  mobile_number = user_object.mobile_number;
           // location = user_object.location;
        }
        //check admin flag
        var departments = await ConfigurationValue.aggregate([
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
        var admin_flags = [];
        departments[0]["departments"].push('Super Admin');
        departments[0]["departments"].forEach(function (department) {
            var query = {};
            query["deleted"] = false;
            query["key"] = "admins";
            query["value." + department] = username;
            ConfigurationValue.find(query, function (err, item) {
                if (err)
                    console.log("Error While getting Admin List");
                if (item.length > 0) {
                    admin_flags.push(department);
                }
            });
        })

        //Check Approve Request
        approve_flag = false;
        var approve_object = await TicketMaster.findOne({ approved_by: username });
        if (approve_object)
            approve_flag = true

        // authenticate(username, password)
        //     .then(function (user_detail) {
        //         const token = jwt.sign({ sub: user_detail.sAMAccountName }, config.secret);//{expiresIn: config.token_life // expires in 24 hours}
        //         result = { status_code: 201, data: { ...user_detail, approve_flag, admin_flags, token, profile_pic_url, mobile_number, location }, message: "Valid User" }
        //         return callback(null, result);
        //     })
            // .catch(function (err) {
            //     console.log(err.message);
            //     if (err && err.message) {
            //         if (err.message.match("data 525")) {
            //             result = { status_code: 400, data: {}, message: "User not found" }
            //         }
            //         else if (err.message.match("data 52e")) {
            //             result = { status_code: 400, data: {}, message: "Invalid credentials" }
            //         }
            //         else if (err.message.match("data 530")) {
            //             result = { status_code: 400, data: {}, message: "Not permitted to logon at this time" }
            //         }
            //         else if (err.message.match("data 531")) {
            //             result = { status_code: 400, data: {}, message: "Not permitted to logon from this workstation" }
            //         }
            //         else if (err.message.match("data 532")) {
            //             result = { status_code: 400, data: {}, message: "Password expired" }
            //         }
            //         else if (err.message.match("data 533")) {
            //             result = { status_code: 400, data: {}, message: "Account disabled" }
            //         }
            //         else if (err.message.match("data 701")) {
            //             result = { status_code: 400, data: {}, message: "Account expired" }
            //         }
            //         else if (err.message.match("data 773")) {
            //             result = { status_code: 400, data: {}, message: "User must reset password" }
            //         }
            //         else if (err.message.match("data 775")) {
            //             result = { status_code: 400, data: {}, message: "Account locked out" }
            //         }
            //     }
            //     else if (err.match("no such user")) {
            //         result = { status_code: 400, data: {}, message: "User not found" }
            //     }
            //     else {
            //         result = { status_code: 400, data: {}, message: "Unknown Error" }
            //     }
            //     return callback(null, result);
            // });
           return { approve_flag, admin_flags, profile_pic_url}
    } else {
        return null;
    }
   


}
















//     console.log("Inside authenticate user");
//     try {

//         ldap.authenticate(username, password, function (err, user) {
//             if (err) {
//                 console.log(err.message);
//                 console.log(err.name);
//                 console.log(err.comment);
//             } else {
//                 console.log("Inside Else");
//                 console.log(user)
//             }
//             // req.user = user;
//         });
//         ldap.close(function (err) {
//             console.log("ldap closed")
//         })
//     } catch (error) {
//         console.log("inside error");
//         console.error(e);
//     }

//     var reqGet = http.request(config.webservice_url + "login/" + username + "/" + password, function (res) {
//         res.on('data', function (data) {
//             user_detail = JSON.parse(data);
//             if (user_detail.status == 201) {
//                 const userWithoutHash = user_detail["data"];
//                 const token = jwt.sign({ sub: userWithoutHash.id }, config.secret);//{expiresIn: config.token_life // expires in 24 hours}
//                 return callback(null, { ...userWithoutHash, token, is_rmg: true });
//             } else {
//                 return callback(null, null);
//             }
//         });
//     });
//     reqGet.end();
//     reqGet.on('error', function (e) {
//         console.log("inside error");
//         console.error(e);
//     });
// }
