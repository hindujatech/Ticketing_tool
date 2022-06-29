// Accessing the Service that we just created

var AddTicketService = require('../services/add_ticket.service')
var path = require("path");
var formidable = require('formidable');
const mail = require('../public/javascripts/mail');
//const department_service = require('./department.controller');
var fs = require("fs");

var http = require('http');
var https = require('https');

const config = require('../config.json');
var moment = require('moment');
//var json2csv = require('json2csv');
const Excel = require("exceljs");



// const mail = require('../public/javascripts/mail');
//for export
// const excel = require('node-excel-export');

exports.create_ticket = async function (req, res, next) {


    var form = new formidable.IncomingForm()
    form.parse(req);
    var file_name = '';
    save_object = {};
    form.on('fileBegin', function (name, file) {
        console.log(file);
        file_name = new Date().getTime() + "." + file.name.split('.').pop();
        file.path = path.join(__dirname, '..') + "\\public\\attachments\\" + file_name;
    })
    form.on('field', function (name, field) {
        save_object[name] = field;
    })
    form.on('error', function (err) {
        res.status(500).json({ status: 200, message: "Error While Uploading File" });
    })
    form.on('end', function () {
        if (file_name)
         //   save_object["attachment"] = "attachments/" + file_name;
         save_object["attachment"] =   file_name;
          //  department_service.sendmail(save_object)
            
           
        AddTicketService.create_ticket(save_object).
        
            then(ticket_object => {
                ticket_object ? res.status(201).json({ status: 201, data: ticket_object, message: "Ticket Added Succesfully" }) : res.status(500).json({ status: 500, message: "Something Went Wrong" });
                getSelectedEmployeeList([ticket_object["created_by"]], function (error, employee_detail) {
              send_mail(req.params.mail, 'create', ticket_object,employee_detail[ticket_object["created_by"]]["employee_name"]);
               
                AddTicketService.get_targetdepartments(save_object.department).
                then(ticketobject => {
                   // console.log(ticketobject)
                 getSelectedEmployeeList(ticketobject, function (error, employeedetail) {
                     var data= Object.values(employeedetail)
                   admin_mail(data,ticket_object,employee_detail[ticket_object["created_by"]]["employee_name"])
                  });
                 
  
              })
              .catch(err => next(err));
            });
              
              // var employee_ids = ticket_data;
              
             


            })
            .catch(err => next(err));
           
    });
}

exports.get_departments = async function (req, res, next) {
    AddTicketService.get_departments()
        .then(departments => departments ? res.json(departments) : res.sendStatus(404))
        .catch(err => next(err));
}
exports.getticket_export = async function (req, res, next) {
    AddTicketService.get_ticketexportfile(req.params.department)
    .then(ticket_object => {
   
    var workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet();
worksheet.columns = [
      { header: "Id", key: "id", width: 10 },
      { header: "Ticket_code", key: "ticket_code", width: 32 },
      { header: "Subject", key: "subject", width: 32 },
      { header: "Description", key: "description", width: 32 },
      { header: "Department", key: "department", width: 32 },
      { header: "Created_by", key: "created_by", width: 32 },
      { header: "Created On", key: "created_on", width: 32 },
      { header: "Status", key: "status", width: 32 },
      { header: "Assigned_to", key: "assigned_to", width: 32 },
      { header: "Admin_description", key: "admin_description", width: 32 },
      { header: "Closed_reason", key: "closed_reason", width: 32 },
      { header: "Assigned On", key: "assigned_on", width: 32 },
    ];
    // worksheet.addRow({ id: 2, name: "Jane Doe", DOB: new Date(1965, 1, 7) });
    ticket_object.forEach(function(item, index) {
        worksheet.addRow({
            id:index+1,
            ticket_code:item.ticket_code,
            subject:item.subject,
            description:item.description,
            department:item.department,
            created_by:item.created_by,
            created_on:item.created_on,
            status:item.status,
            assigned_to:item.assigned_to,
            admin_description:item.admin_description,
            closed_reason:item.closed_reason,
            assigned_on:item.assigned_on           
        })
      })
      

    workbook.xlsx
      .writeFile("newSaveeee.xlsx")
      .then(response => {
        console.log("file is written");
        console.log(path.join(__dirname, "../newSaveeee.xlsx"));
        res.sendFile(path.join(__dirname, "../newSaveeee.xlsx"));
      })
      .catch(err => {
        console.log(err);
      });
 

    })
    .catch(err =>
        console.log(err)
    )
         //next(err));
    
    
}
exports.getrm_data = async function (req, res, next) {
    // var employeeid=req.body.department
    // var parts = employeeid.split("-");
    // var first = "16930";
    // var second = parts[1];
    // console.log(first)
    
    // getSelectedEmployeeList(first, function (error, employee_detail) {
    //     //send_mail(req.params.mail, 'create', ticket_object,employee_detail[ticket_object["created_by"]]["employee_name"]);
    //     console.log(employee_detail)
    // })
    var employee_ids=[];
    var ticket_detail = await AddTicketService.get_ticket_detail(req.body.department);
    //employee_ids = ticket_detail["admins"].slice();
    employee_ids.push(ticket_detail["created_by"]);
    //if (ticket_detail["ticket_detail"]["assigned_to"])
      //  employee_ids.push(ticket_detail["ticket_detail"]["assigned_to"]);
   // if (ticket_detail["ticket_detail"]["approved_by"])
      //  employee_ids.push(ticket_detail["ticket_detail"]["approved_by"]);
      getEmployeeDetail(employee_ids, function (error, employee_detail) {
        console.log(employee_detail)
    })
      
   
}
exports.employee_dashboard = async function (req, res, next) {
    try {
        console.log("ssadsddee",req.params.employee_id)
        var ticket_data = await AddTicketService.employee_dashboard(req.params.employee_id);
        console.log(ticket_data)
        getSelectedEmployeeList([req.params.employee_id], function (error, employee_detail) {
            if (error)
                return res.status(400).json({ status: 400, data: {}, message: "Something went wrong. Unable connect mysql webservices" })

            res.status(201).json({ data: { ticket_data, employee_detail }, message: "Job List Data Get Succesfully" })
        })
        // return res.status(201).json({ status: 201, data: ticket_data, message: "Dashboard Data Got Succesfully" })
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }
}

exports.department_admin_dashboard = async function (req, res, next) {
    try {
        console.log("department",req.params.department)
        var ticket_data = await AddTicketService.department_admin_dashboard(req.params.department.trim());
        console.log("aasdasda",ticket_data)
        var employee_ids = ticket_data["employee_ids"];
        console.log("emp_id",employee_ids);
        getSelectedEmployeeList(employee_ids, function (error, employee_detail) {
            if (error)
                return res.status(400).json({ status: 400, data: {}, message: "Something went wrong. Unable connect mysql webservices" })

            res.status(201).json({ data: { ticket_data, employee_detail }, message: "Job List Data Get Succesfully" })
        })
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }
}

exports.target_subdepartments = async function (req, res, next) {
    try {
        var ticket_data = await AddTicketService.get_subdepartments(req.body.department.trim());
        console.log(ticket_data)
       var adminsdata= await AddTicketService.get_targetdepartments(req.body.department.trim())
       var subcategory= await AddTicketService.get_subcategory(req.body.department.trim())
      // console.log(subcategory)
       getSelectedEmployeeList(adminsdata, function (error, employee_detail) {
        if (!error)
        {
            //console.log(employee_detail)
            //var employee_ids= Object.values(employee_detail)
           // console.log(employee_ids.employee_name)
           res.status(201).json({ data: { ticket_data, employee_detail,adminsdata,subcategory }, message: "Job List Data Get Succesfully" })
          // return res.status(201).json({ status: 400, data: {ticket_data,adminsdata,employee_detail}, message: "Something went wrong. Unable connect mysql webservices" })
        }
           

        //res.status(201).json({ data: { ticket_data, employee_detail }, message: "Job List Data Get Succesfully" })
    })
       // res.status(201).json({ data:{ ticket_data }, message: "Ticket List Data Get Succesfully" })
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }
}
exports.super_admin_dashboard = async function (req, res, next) {
    try {
        var ticket_data = await AddTicketService.super_admin_dashboard(req.params.employee_id);

        var employee_ids = [];
        for (var object of ticket_data["over_all"]) {
            employee_ids.push(object.created_by);
        }
        getSelectedEmployeeList(employee_ids, function (error, employee_detail) {
            if (error)
                return res.status(400).json({ status: 400, data: {}, message: "Something went wrong. Unable connect mysql webservices" })

            res.status(201).json({ data: { ticket_data, employee_detail }, message: "Job List Data Get Succesfully" })
        })
    } catch (e) {
        return res.status(400).json({ status: 400, message: "Something Went Wrong" })
    }
}

exports.profile_pic_upload = async function (req, res, next) {

    var form = new formidable.IncomingForm()
    form.parse(req);
    var file_name = '';
    form.on('fileBegin', function (name, file) {
        file_name = req.params.employee_id + "_" + new Date().getTime() + "." + file.name.split('.').pop();
        file.path = path.join(__dirname, '..') + "\\public\\employee_pics\\" + file_name;
    })
    form.on('error', function (err) {
        res.status(500).json({ status: 200, message: "Error While Uploading File" });
    })
    form.on('end', function () {
        var url = "employee_pics/" + file_name;
        try {
            AddTicketService.profile_pic_upload(req.params.employee_id, url);
            return res.status(200).json({ status: 200, data: url, message: "Succesfully File Recevied" })
        } catch (e) {
            return res.status(500).json({ status: 500, message: "Something Went Wrong" })
        }
    });
    // return res.status(200).json({ status: 200, message: "Succesfully File Recevied" })
}

exports.edit_information = async function (req, res, next) {
    try {
        var user_object = await AddTicketService.edit_information(req.params.employee_id, req.body.location, req.body.mobile_number);
        return res.status(201).json({ status: 201, data: user_object, message: "User Detail Updated Succesfully" })
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }
}

exports.get_ticket_detail = async function (req, res, next) {
    try {
        var employee_ids = [];
        var ticket_detail = await AddTicketService.get_ticket_detail(req.params.ticket_id);
        employee_ids = ticket_detail["admins"].slice();
        employee_ids.push(ticket_detail["ticket_detail"]["created_by"]);
        if (ticket_detail["ticket_detail"]["assigned_to"])
            employee_ids.push(ticket_detail["ticket_detail"]["assigned_to"]);
        if (ticket_detail["ticket_detail"]["approved_by"])
            employee_ids.push(ticket_detail["ticket_detail"]["approved_by"]);
        getSelectedEmployeeList(employee_ids, function (error, employee_detail) {
            if (error)
                return res.status(400).json({ status: 400, data: {}, message: "Something went wrong. Unable connect mysql webservices" })
                var ticket_status=ticket_detail["ticket_detail"]["status"]
                console.log(ticket_status)
                 AddTicketService.get_ticket_histroy(ticket_detail["ticket_detail"]["ticket_code"])
                 .then(ticket_histroy => {

                    console.log(ticket_histroy)
                    var ticket_details=ticket_histroy;
                    res.status(201).json({ data: { ticket_detail, employee_detail,ticket_details }, message: "Ticket List Data Get Succesfully" })
      
                     
                     
   

                 })
        .catch(err => next(err));
       // res.status(201).json({ data: { ticket_detail, employee_detail }, message: "Ticket List Data Get Succesfully" })
        
    
                })
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }
}
exports.sendassgned_mail = async function (req, res, next) {
    var employee_id =  req.params.employee_id;
    var parts = employee_id.split("-");
    var first = parts[0];
    var second = parts[1];
    console.log(first)
    var employee_ids=[];
    var ticket_raised_id=[];
    employee_ids.push(req.body.assigned)
    ticket_raised_id.push(first)
    console.log(ticket_raised_id);
   
    getSelectedEmployeeList(employee_ids, function (error, employee_detail) {
        if (!error)
        {
           // console.log('data is must',employee_detail)
            var assigned_details= Object.values(employee_detail)
          
           
    getSelectedEmployeeList(ticket_raised_id, function (error, employeedetail) {
        if (!error)
        {
            
            var raised_details= Object.values(employeedetail)
            var work_email_address= Object.values(assigned_details)
            var emp_name = work_email_address.map(function(object) {
            return object.employee_name;
            });
            var name=emp_name.toString().replace(/[\[\]']+/g,'')
            var employee_data = name.split("-");
            var employee_name = employee_data[1];
            //asigned mail_details
            var engineer_usedetails_1= Object.values(raised_details)
            var emp_name1 = engineer_usedetails_1.map(function(object) {
            return object.employee_name;
            });
            var name1=emp_name1.toString().replace(/[\[\]']+/g,'')
           var employee_data_1 = name1.split("-");
            var employee_name_1 = employee_data_1[1];
           assgined_mail(assigned_details,employee_name_1,'engineer',req.body.ticket_code)
           //raised mail details

           assgined_mail(raised_details,employee_name,'user',req.body.ticket_code)
         
            


        }
        
    })



        }
        
    })
    
  
  
   
}
exports.get_filtered_employee_list = async function (req, res, next) {
    getFliteredEmployeeList(req.params.filtered_value, function (error, response) {
        if (error)
            return res.status(400).json({ status: 400, data: {}, message: "Something went wrong. Unable connect mysql webservices" })
        return res.status(201).json({ status: 201, data: response, message: "Employee List Got Succesfully" })
    })
}


exports.save_admin_ticket_edit = async function (req, res, next) {

    try {

        if (req.body.department_change) {
            AddTicketService.update_department(req.body)
                .then(updated_object => updated_object ? res.json({ status: 201, message: "Department Updated Successfully" }) : res.sendStatus(404))
                .catch(err => next(err));
        } else {

            if (req.body.status!='Assigned' && req.body.status!='Closed' && req.body.status!='Confirm' && moment(req.body.addressed_on, 'DD-MM-YYYY HH:mm').isValid()) {
                req.body.addressed_on = moment(req.body.addressed_on, 'DD-MM-YYYY HH:mm').format("YYYY-MM-DDTHH:mm:ss.SSS")
            } else if (req.body.status!='Assigned'  && req.body.status!='Closed' && req.body.status!='Confirm'){
                req.body.addressed_on = moment(req.body.addressed_on, 'YYYY-MM-DDTHH:mm:ss.SSS').format("DD-MM-YYYY HH:mm")
            }

            if (req.body.status!='Assigned' && req.body.status!='Closed' && req.body.status!='Confirm' && moment(req.body.tentative_closed_on, 'DD-MM-YYYY HH:mm').isValid()) {
                req.body.tentative_closed_on = moment(req.body.tentative_closed_on, 'DD-MM-YYYY HH:mm').format("YYYY-MM-DDTHH:mm:ss.SSS")
            } else if (req.body.status!='Assigned' && req.body.status!='Closed' && req.body.status!='Confirm'){
                req.body.tentative_closed_on = moment(req.body.tentative_closed_on, 'YYYY-MM-DDTHH:mm:ss.SSS').format("DD-MM-YYYY HH:mm")
            }
           // console.log(req.body)
           if(req.body.status=='Processing' || req.body.status=='Closed')
           {
            AddTicketService.get_ticket_detail(req.body.ticket_id).then(ticket_object => {
               // console.log(ticket_object.ticket_detail:)
               var result =ticket_object.ticket_detail;
               var employee_ids=[];
               employee_ids.push(result["created_by"])
               getSelectedEmployeeList(employee_ids, function (error, employeedetail) {
              
                var work_email_address= Object.values(employeedetail)
                var emp_name = work_email_address.map(function(object) {
                return object.employee_name;
                });
                //var data= Object.values(employeedetail)
                console.log(emp_name)
                var name1=emp_name.toString().replace(/[\[\]']+/g,'')
                var employee_data_1 = name1.split("-");
                if(req.body.status=='Closed')
                {
                    assgined_mail(work_email_address,'employee_data_1','closed',result["ticket_code"])

                }

                
             
             });
             
              
               

            })
           }
          
            AddTicketService.update_ticket_detail(req.body)
                .then(updated_object =>  updated_object ?  res.json({ status: 201, message: "Ticket Details Updated Successfully" }) : res.sendStatus(404))
                .catch(err => next(err));
        }
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }


}

exports.get_overall_admin_list = async function (req, res, next) {
    try {
        var ticket_data = await AddTicketService.get_overall_admin_list();
        res.status(201).json({ data: ticket_data, message: "Overall Admins Get Succesfully" })
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }
}

exports.get_request_list = async function (req, res, next) {
    try {
        var ticket_data = await AddTicketService.get_request_list(req.params.employee_id);
        res.status(201).json({ data: ticket_data, message: "Request List Data Get Succesfully" })

        // var employee_ids = ticket_data["employee_ids"];
        // getSelectedEmployeeList(employee_ids, function (error, employee_detail) {
        //     if (error)

        //     res.status(201).json({ data: { ticket_data, employee_detail }, message: "Request List Data Get Succesfully" })
        // })
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }
}
function getFliteredEmployeeList(filtered_value, callback) {
    var return_data;
    var reqGet = https.request(config.webservice_url + "getFliteredEmployeeList/" + filtered_value, function (res) {
        var buffers = [];
        res
            .on('data', function (chunk) {
                buffers.push(chunk)

            })
            .on('end', function () {
                try {
                    return_data = JSON.parse(Buffer.concat(buffers).toString());
                    return callback(null, return_data);
                } catch (err) {
                    console.error(err)
                }
            })

    });
    reqGet.end();
    reqGet.on('error', function (e) {
        console.log("inside error");
        console.error(e);
    });

}
function getSelectedEmployeeList(employee_ids, callback) {
    var return_data;
    var data = JSON.stringify(employee_ids);
    if (employee_ids.length > 0) {
        var reqGet = https.request(config.webservice_url + "getSelectedEmployeeList/", {
            method: "POST", headers: {
                'Content-Type': 'application/json',
            }
        }, function (res) {
            var buffers = [];
            res
                .on('data', function (chunk) {
                    buffers.push(chunk)

                })
                .on('end', function () {
                    try {
                        return_data = JSON.parse(Buffer.concat(buffers).toString());
                        return callback(null, return_data);
                    } catch (err) {
                        console.error(err)
                    }
                })

        });
        reqGet.write(data)
        reqGet.end();
        reqGet.on('error', function (e) {
            console.log("inside error");
            console.error(e);
        });
    } else {
        callback(null, []);
    }

}
function getEmployeeDetail(employee_id, callback) {
    var return_data;
    var reqGet = https.request(config.webservice_url + "getEmployeeDetail/" + employee_id, function (res) {
        res.on('data', function (data) {
            try {
                return_data = JSON.parse(data);
                return callback(null, return_data);
            } catch (err) {
                console.error(err)
            }
        });
    });
    reqGet.end();
    reqGet.on('error', function (e) {
        console.log("inside error");
        console.error(e);
    });

}


function send_mail(to_mail, type, ticket_object,emp_name) {

    console.log(to_mail)
    var subject = '';
    var body = '';
    if (type=='create') {
        console.log(to_mail)
        subject = "Ticket Created (Ref No.-" + ticket_object["ticket_code"] + ")";
        body = "Dear User,\n\n" +
            "Your ticket Ref No.-" + ticket_object["ticket_code"] + " \n\n" +
            "An engineer will be in touch with you to resolve the issue\n\n" +
            "Regards,\n" +
            "Ticketing Admin";
        

    } else if (type == 'update') {
        subject = "Ticket Updated (Ref No.-" + ticket_object["ticket_code"] + ")";
        body = "Dear User,\n\n" +
                "A New Feedback entered by " + emp_name + " for Ref No.-" + ticket_object["ticket_code"] + " is awaiting for your reply/solution.\n\n" +
                "Regards,\n" +
                "Ticketing Admin";

    }

    var mailOptions = {
        from:'helpdesk@hindujatech.com',
        to: to_mail,
        subject: subject,
        text: body
    };
    try {
        mail.mail_configuration.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + mailOptions.from);
            }
        });
    }
    catch (e) {
        
        console.log(e);
    }


}

function admin_mail(object,ticketobject,emp_name) {
   // console.log('data',emp_name)

    var subject = '';
    var body = '';

        subject = "Ticket Created (Ref No.-" + ticketobject["ticket_code"] + ")";
        body = "Dear User,\n\n" +
            "Ticket Submitted by " + emp_name + " for Ref No.-" + ticketobject["ticket_code"] + " is waiting for your reply/solution.If the ticket does not belong to your support group, please re-assign to the right group.\n\n" +
            "Regards,\n" +
            "Ticketing Admin";
        

    
   console.log('data',object)
    for(var i=0;i<=object.length;i++)
    {
          //  console.log('data',object[i])

       var mailOptions = {
         from:'helpdesk@hindujatech.com',
         to: object[i].work_email_address,
         subject: subject,
         text: body
        };
        try {
            mail.mail_configuration.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + mailOptions.from);
                }
            });
        }
        catch (e) {
            
            console.log(e);
        }

    }

 

}
function assgined_mail(raised_details,assigned_details,usertype,ticket_code) {
    if(usertype=="user")
    {
        for(var i=0;i<=raised_details.length;i++)
        {
          //  console.log(raised_details[i].work_email_address)
            if(raised_details[i]!=undefined)
            {
                var subject = '';
                var body = '';
        
                subject = "Engineer Assigned to Ticket Created (Ref No.-" + ticket_code + ")";
                body = "Dear User,\n\n" +
                    assigned_details + " is assigned to work on your ticket - "  + ticket_code + " and will update you when the issue is resolved.\n\n" +
                    "Regards,\n" +
                    "Ticketing Admin";
                    var mailOptions = {
                        from:'helpdesk@hindujatech.com',
                        to:raised_details[i].work_email_address,
                        subject: subject,
                        text: body
                       };
                       try {
                           mail.mail_configuration.sendMail(mailOptions, function (error, info) {
                               if (error) {
                                   console.log(error);
                               } else {
                                   //console.log('Email sent: ' + mailOptions.from);
                               }
                           });
                       }
                       catch (e) {
                           
                           console.log(e);
                       }
              

            }
           
            
    
        }
     
    // 

    }
  // console.log('assigned',raised_details.work_email_address);  
  if(usertype=="closed")
  {
   //  console.log()
      for(var i=0;i<=raised_details.length;i++)
      {
        
          if(raised_details[i]!=undefined)
          {
            ///console.log(raised_details[i].work_email_address)
              var subject = '';
              var body = '';
      
              subject = "Engineer closed the Ticket Created (Ref No.-" + ticket_code + ")";
              body = "Dear User,\n\n" +
                     "Ticket - "  + ticket_code + " raised by yourself has now been closed. Please check ticket for details. .\n\n" +
                  "Regards,\n" +
                  "Ticketing Admin";
                  var mailOptions = {
                      from:'helpdesk@hindujatech.com',
                      to:raised_details[i].work_email_address,
                      subject: subject,
                      text: body
                     };
                     try {
                         mail.mail_configuration.sendMail(mailOptions, function (error, info) {
                             if (error) {
                                 console.log(error);
                             } else {
                                console.log('Email sent: ' + mailOptions.from);
                             }
                         });
                     }
                     catch (e) {
                         
                         console.log(e);
                     }
            

          }
         
          
  
      }
   
  // 

  }
  if(usertype=="cancel")
  {
    // console.log()
      for(var i=0;i<=raised_details.length;i++)
      {
        
          if(raised_details[i]!=undefined)
          {
            //console.log('you data',raised_details[i].work_email_address)
              var subject = '';
              var body = '';
      
              subject = "User has Cancelled the  Ticket Created (Ref No.-" + ticket_code + ")";
              body = "Dear User,\n\n" +
                     "You have cancelled the ticket Ref No.- "   + ticket_code + ". \n\n" +
                  "Regards,\n" +
                  "Ticketing Admin";
                  var mailOptions = {
                      from:'helpdesk@hindujatech.com',
                      to:raised_details[i].work_email_address,
                      subject: subject,
                      text: body
                     };
                     try {
                         mail.mail_configuration.sendMail(mailOptions, function (error, info) {
                             if (error) {
                                 console.log(error);
                             } else {
                                console.log('Email sent: ' + mailOptions.from);
                             }
                         });
                     }
                     catch (e) {
                         
                         console.log(e);
                     }
            

          }
         
          
  
      }
   
  // 

  }
  if(usertype=="engineer")
  {
      for(var i=0;i<=raised_details.length;i++)
      {
        if(raised_details[i]!=undefined)
        {
         // console.log('engineer must calculation',raised_details[i].work_email_address)
          var subject = '';
          var body = '';
  
          subject = "Ticket Assigned to  (Ref No.-" + ticket_code + ")";
          body = "Dear User,\n\n" +
              assigned_details + " had  Raised  a  ticket - "  + ticket_code + " and assigned to you .\n\n" +
              "Regards,\n" +
              "Ticketing Admin";
              var mailOptions = {
                  from:'helpdesk@hindujatech.com',
                  to:raised_details[i].work_email_address,
                  subject: subject,
                  text: body
                 };
                 try {
                     mail.mail_configuration.sendMail(mailOptions, function (error, info) {
                         if (error) {
                             console.log(error);
                         } else {
                             console.log('Email sent: ' + mailOptions.from);
                         }
                     });
                 }
                 catch (e) {
                     
                     console.log(e);
                 }
            }
         
          
  
      }
   
  // 

  }
 }
exports.save_employee_ticket_edit = async function (req, res, next) {
    try {       
           AddTicketService.update_employee_ticket_detail(req.body)
               .then(updated_object => {
                   if(updated_object){
                    getSelectedEmployeeList([updated_object[0]["assigned_to"]], function (error, employee_detail) {
                        //console.log(employee_detail[updated_object[0]["modified_by"]]["employee_name"])
                     send_mail(employee_detail[updated_object[0]["assigned_to"]]["work_email_address"], 'update', updated_object[0],employee_detail[updated_object[0]["modified_by"]]["employee_name"]);
                    

                })
            //     getSelectedEmployeeList([updated_object[0]["assigned_to"]], function (error, employee_detail) {
            //         console.log(updated_object[0]["department"])
            //      send_mail(employee_detail[updated_object[0]["assigned_to"]]["work_email_address"], 'user-update', updated_object[0],employee_detail[updated_object[0]["modified_by"]]["employee_name"]);
                
            // })
                    res.json({ status: 201, message: "Ticket Details Updated Successfully" });  
                   }else{
                    res.sendStatus(404);
                   }
                   
                })
               .catch(err => next(err));
            
     
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }


}
exports.table_update_description = async function (req, res, next) {
    try {       
           AddTicketService.update_employee_ticket_detail_description(req.body)
               .then(updated_object => {
                   if(updated_object){
                       console.log(updated_object)
                //     getSelectedEmployeeList([updated_object[0]["assigned_to"]], function (error, employee_detail) {
                //         //console.log(employee_detail[updated_object[0]["modified_by"]]["employee_name"])
                //      //send_mail(employee_detail[updated_object[0]["assigned_to"]]["work_email_address"], 'update', updated_object[0],employee_detail[updated_object[0]["modified_by"]]["employee_name"]);
                    

                // })
            //     getSelectedEmployeeList([updated_object[0]["assigned_to"]], function (error, employee_detail) {
            //         console.log(updated_object[0]["department"])
            //      send_mail(employee_detail[updated_object[0]["assigned_to"]]["work_email_address"], 'user-update', updated_object[0],employee_detail[updated_object[0]["modified_by"]]["employee_name"]);
                
            // })
                    res.json({ status: 201, message: "Ticket Details Updated Successfully" });  
                   }else{
                    res.sendStatus(404);
                   }
                   
                })
               .catch(err => next(err));
            
     
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }


}
exports.ticketmaster_delete_id = async function (req, res, next) {
    try {       
           AddTicketService.delete_objectid(req.body)
               .then(updated_object => {
                   if(updated_object){
                   // console.log('data',updated_object)
                    getSelectedEmployeeList([updated_object[0]["created_by"]], function (error, employee_detail) {
                        console.log('data',employee_detail)
                        var work_email_address= Object.values(employee_detail)
                        var emp_name = work_email_address.map(function(object) {
                        return object.employee_name;
                        });
                        //var data= Object.values(employeedetail)
                       // console.log(emp_name)
                        var name1=emp_name.toString().replace(/[\[\]']+/g,'')
                        var employee_data_1 = name1.split("-");
                        assgined_mail(work_email_address,employee_data_1, 'cancel', updated_object[0]["ticket_code"]);
                    

                })
            //     getSelectedEmployeeList([updated_object[0]["assigned_to"]], function (error, employee_detail) {
            //         console.log(updated_object[0]["department"])
            //      send_mail(employee_detail[updated_object[0]["assigned_to"]]["work_email_address"], 'user-update', updated_object[0],employee_detail[updated_object[0]["modified_by"]]["employee_name"]);
                
            // })
                    res.json({ status: 201, message: "Ticket Details Deleted Successfully" });  
                   }else{
                    res.sendStatus(404);
                   }
                   
                })
               .catch(err => next(err));
            
     
    } catch (e) {
        return res.status(500).json({ status: 500, message: "Something Went Wrong" })
    }


}

exports.get_all_employee_details = async function (req, res, next) {
    try {
        geRRFCreationDetail(function (error, employee_detail) {
            if (error)
                return res.status(400).json({ status: 400, data: {}, message: "Something went wrong. Unable connect mysql webservices" })
            else
                return res.status(201).json({ status: 201, data: { ...employee_detail }, message: "Job detail Get Succesfully" })
        })
    } catch (e) {
        return res.status(400).json({ status: 400, message: "Something Went Wrong" });
    }
}

function geRRFCreationDetail(callback) {
    var reqGet = https.request(config.webservice_url + "geRRFCreationDetail/", function (res) {
        var buffers = [];
        res.on('data', function (chunk) {
            buffers.push(chunk)

        }).on('end', function (data) {
            try {
                return_data = JSON.parse(Buffer.concat(buffers).toString());
                return callback(null, return_data);
            } catch (err) {
                console.error(err)
            }
        });
    });
    reqGet.end();
    reqGet.on('error', function (e) {
        console.error(e);
    });

}



