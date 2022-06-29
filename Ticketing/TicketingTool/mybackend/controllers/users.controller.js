// Accessing the Service that we just created

var UserService = require('../services/users.service');
var http = require('http');
var https = require('https');
const jwt = require('jsonwebtoken');
const config = require('../config.json');

exports.authenticateUser = async function (req, res, next) {
    console.log("Auth",req.body);
    console.log(req.body);
    var authDetail = await UserService.authenticateUser(req.body)
    doAuthendication(req.body, function (error, employee_detail) {
        if (error || employee_detail === null)
            return res.status(400).json({ status: 400, data: {}, message: "Username and Password is incorrect." })
        // console.log(employee_detail)
        // console.log(authDetail)
       return res.status(201).json({ data: { ...employee_detail, ...authDetail }, message: "Login Succesfully" })
    })

    // UserService.authenticateUser((req.body), function (error, response) {
    //     if (error)
    //         throw new Error("Error while fetching fetching data");
    //     response ? res.status(response.status_code).json({ data:response.data,message: response.message }) : res.status(400).json({ message: 'Something Went Wrong' })
    // });
}

exports.userauthenticateUser = async function (req, res, next) {
    try { 
        console.log("logindetails",req.body)
    const imei_no  = req.body.imie_no;
    
    if(!imei_no)
    {
        return res.status(201).json({  success: false, message:"", "messageStatus": "Enter your Imie No" })

    }
    else{
       
    doAuthendication(req.body,async function (error, employee_detail) {
        console.log("employee_detailrt",employee_detail);
        if (error || employee_detail === null)
        {
             return res.status(201).json({  success: false, message:"", "messageStatus": "Username and Password is incorrect." })

        }
        else{
             return res.status(200).json({ success: true, message:{ ...employee_detail,"profile_pic_url":''},"messageStatus":"Logged in successfully"}) 

        }
           
       
        // console.log(authDetail)
       
      
    })

    }
    

  
}catch (err) {
    throw err;
  }
}
function doAuthendication({ username, password }, callback) {
    var reqGet = https.request(config.webservice_url + "login/" + username + "/" + encodeURIComponent(password), function (res) {
        res.on('data', function (data) {

            user_detail = JSON.parse(data);
            console.log(user_detail);
            if (user_detail.status == 201) {
                const userWithoutHash = user_detail["data"];
                const token = jwt.sign({ sub: userWithoutHash.id }, config.secret);//{expiresIn: config.token_life // expires in 24 hours}

                return callback(null, { ...userWithoutHash, token });


            } else {
                return callback(null, null);
            }
        });
    });
    reqGet.end();
    reqGet.on('error', function (e) {
        console.log("inside error");
        console.error(e);
    });
}