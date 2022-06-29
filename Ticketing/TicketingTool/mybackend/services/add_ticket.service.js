// Gettign the Newly created Mongoose Model we just created 
var TicketMaster = require('../models/ticket_masters.model');
var ConfigurationValue = require('../models/configuration_values.model');
var UserDetail = require('../models/user_details.model');
var ticket_histroy = require('../models/ticket_histroy');
const { ObjectID } = require('mongodb');
ObjectId = require('mongoose').Types.ObjectId;

exports.create_ticket = async function (save_data) {
    ticket_master_save_object = new TicketMaster(save_data);
    return ticket_master_save_object.save()
}
exports.get_departments = async function () {
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
    return departments[0]["departments"];
}
exports.get_ticketexportfile = async function (department) {
    if(department!="Super Admin")
    {
        return await TicketMaster.aggregate([
            {
                $match: {
                    "department":department,
                    "deleted": false
                }
            },
        ]);
    }
    else{
        return await TicketMaster.aggregate([
            {
                $match: {
                "deleted": false
                }
            },
        ]);

    }
   
   

}
exports.get_targetdepartments = async function (selected_department) {
    var departments = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "admins",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "departments": '$value.' + selected_department
            }
        }
    ]);
    return departments[0]["departments"];
}
exports.get_subdepartments = async function (selected_department) {
    var departments = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "sub_functions",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "departments": '$value.' + selected_department
            }
        }
    ]);
    return departments[0]["departments"];
}
exports.get_subcategory = async function (selected_department) {
    var departments = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "ticket_category",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "departments": '$value.' + selected_department
            }
        }
    ]);
    return departments[0]["departments"];
}
exports.employee_dashboard = async function (employee_id) {

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
    var status_configuration = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "ticket_status_mapping",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "ticket_status_mapping": "$value"
            }
        }
    ]);

    var department_table_object = await TicketMaster.aggregate([

        {
            $match: {
                "created_by": employee_id,
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': '$department',
                'tickets': {
                    '$push': '$$ROOT'
                }
            }
        }

    ]);


    var department_graph_object = await TicketMaster.aggregate([

        {
            $match: {
                "created_by": employee_id,
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': {
                    department: '$department',
                    status: "$status"
                },
                "departmentCount": { "$sum": 1 }
            }
        },
        {
            "$group": {
                "_id": "$_id.department",
                "status": {
                    "$push": {
                        "name": "$_id.status",
                        "value": "$departmentCount"
                    },
                },
                "totalCount": { "$sum": "$departmentCount" }
            }
        },

    ]);

    var status_object = await TicketMaster.aggregate([

        {
            $match: {
                "created_by": employee_id,
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': '$status',
                'count': {
                    '$sum': 1
                }
            }
        }

    ]);
    var result = { department_table: {}, department_bar: [], department_graph: [], status: {}, over_all: [], departments: [], status_configuration: {} };
    result["departments"] = departments[0]["departments"];
    result["status_configuration"] = status_configuration[0];
    for (var department of department_table_object) {
        result["department_table"][department._id] = department.tickets
        result["department_graph"].push({
            name: department._id,
            value: department.tickets.length
        })
        result["over_all"].push(...Array.from(Object.keys(department.tickets), k => department.tickets[k]));
    }
    for (var status of status_object) {
        

        if(status._id=="Waiting For Approval")
        {
            status._id="Waiting_For_Approval"
        }
        if(status._id=="Work Around")
        {
            status._id="Work_Around"
        }
        
       
        //result["status"][result["status_configuration"]["ticket_status_mapping"][status._id]] = status.count
        result["status"][status._id] = status.count
    }
    for (var department of department_graph_object) {
        for (var index in department.status) {
            department.status[index]["name"]=result["status_configuration"]["ticket_status_mapping"][department.status[index]["name"]]
        }
        result["department_bar"].push({ name: department._id, series: department.status });
    }
    // console.log(result)
    return result;
}
exports.profile_pic_upload = async function (username, profile_picture_url) {
    user_profile_save_object = new UserDetail({ username, profile_picture_url });
    var user_obj = UserDetail.findOneAndUpdate(
        { "username": username, deleted: false },
        { $set: { "username": username, "profile_picture_url": profile_picture_url, created_on: new Date() } },
        { upsert: true, returnNewDocument: true, new: true },
    );
    return user_obj
}
exports.edit_information = async function (username, location, mobile_number) {
    user_profile_save_object = new UserDetail({ username, location, mobile_number });
    var user_obj = UserDetail.findOneAndUpdate(
        { "username": username, deleted: false },
        { $set: { "username": username, "location": location, "mobile_number": mobile_number, created_on: new Date() } },
        { upsert: true, returnNewDocument: true, new: true },
    );
    return user_obj
}


exports.super_admin_dashboard = async function () {

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


    var department_table_object = await TicketMaster.aggregate([

        {
            $match: {
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': '$department',
                'tickets': {
                    '$push': '$$ROOT'
                }
            }
        }

    ]);


    var department_graph_object = await TicketMaster.aggregate([

        {
            $match: {
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': {
                    department: '$department',
                    status: "$status"
                },
                "departmentCount": { "$sum": 1 }
            }
        },
        {
            "$group": {
                "_id": "$_id.department",
                "status": {
                    "$push": {
                        "name": "$_id.status",
                        "value": "$departmentCount"
                    },
                },
                "totalCount": { "$sum": "$departmentCount" }
            }
        },

    ]);

    var status_object = await TicketMaster.aggregate([

        {
            $match: {
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': '$status',
                'count': {
                    '$sum': 1
                }
            }
        }

    ]);
    var result = { department_table: {}, department_bar: [], department_graph: [], status: {}, over_all: [], departments: [] };
    result["departments"] = departments[0]["departments"];
    for (var department of department_table_object) {
        result["department_table"][department._id] = department.tickets
        result["department_graph"].push({
            name: department._id,
            value: department.tickets.length
        })
        result["over_all"].push(...Array.from(Object.keys(department.tickets), k => department.tickets[k]));
    }
    for (var status of status_object) {
        result["status"][status._id] = status.count
    }
    for (var department of department_graph_object) {
        result["department_bar"].push({ name: department._id, series: department.status });
    }
    return result;
}


exports.department_admin_dashboard = async function (selected_department) {


    var department_table_object = await TicketMaster.aggregate([

        {
            $match: {
                "department": selected_department,
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': '$assigned_to',
                'tickets': {
                    '$push': '$$ROOT'
                }
            }
        }

    ]);


    var department_graph_object = await TicketMaster.aggregate([

        {
            $match: {
                "department": selected_department,
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': {
                    assigned_to: '$assigned_to',
                    status: "$status"
                },
                "assignedToCount": { "$sum": 1 }
            }
        },
        {
            "$group": {
                "_id": "$_id.assigned_to",
                "status": {
                    "$push": {
                        "name": "$_id.status",   
                        "value": "$assignedToCount"
                    },
                },
                "totalCount": { "$sum": "$assignedToCount" }
            }
        },

    ]);
console.log(department_graph_object);
    var status_object = await TicketMaster.aggregate([

        {
            $match: {
                "department": selected_department,
                "deleted": false
            }
        },
        {
            '$group': {
                '_id': '$status',
                'count': {
                    '$sum': 1
                }
            }
        }

    ]);


    var result = { department_table: {}, department_bar: [], department_graph: [], status: {}, over_all: [] };

    for (var department of department_table_object) {
        if (department._id == null)
            department._id = 'Unassigned';
        result["department_table"][department._id] = department.tickets
        result["department_graph"].push({
            name: department._id,
            value: department.tickets.length
        })
        result["over_all"].push(...Array.from(Object.keys(department.tickets), k => department.tickets[k]));
    }
    for (var status of status_object) {
        result["status"][status._id] = status.count
    }
    for (var department of department_graph_object) {
        if (department._id == null)
            department._id = 'Unassigned';
        result["department_bar"].push({ name: department._id, series: department.status });
    }

    var employee_ids = Object.keys(result["department_table"]);
    var index = employee_ids.indexOf('Unassigned');
    if (index > -1) {
        employee_ids.splice(index, 1);
    }
    for(var res of result["over_all"]){
        employee_ids.push(res.created_by); 
    }
    result["employee_ids"] = employee_ids;

    return result;
}


exports.get_ticket_detail = async function (ticket_id) {
    var ticket_detail = await TicketMaster.aggregate([

        {
            $match: {
                "_id": ObjectId(ticket_id)
            }
        },
    ]);
    selected_department = ticket_detail["0"]["department"];
    var project = { $project: {} };
    project["$project"]["_id"] = 0;
    project["$project"]["sub_functions"] = '$value.' + selected_department;
    var sub_functions = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "sub_functions",
                "deleted": false
            }
        },
        project
    ]);
    var project = { $project: {} };
    project["$project"]["_id"] = 0;
    project["$project"]["ticket_category"] = '$value.' + selected_department;
    var ticket_category = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "ticket_category",
                "deleted": false
            }
        },
        project
    ]);



    var priority = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "priority",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "priority": "$value"
            }
        }
    ]);
    var project = { $project: {} };
    project["$project"]["_id"] = 0;
    project["$project"]["admins"] = '$value.' + selected_department;
    var admins = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "admins",
                "deleted": false
            }
        },
        project
    ]);

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
    var ticket_admin_status = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "ticket_admin_status",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "ticket_status": "$value"
            }
        }
    ]);
    var ticket_status_mapping = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "ticket_status_mapping",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "ticket_status": "$value"
            }
        }
    ]);
    var ticket_user_status = await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "ticket_user_status",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "ticket_status": "$value"
            }
        }
    ]);


    result = {};
    result["ticket_detail"] = ticket_detail[0];
    result["sub_functions"] = sub_functions[0]["sub_functions"];
    result["ticket_category"] = ticket_category[0]["ticket_category"];
    result["priority"] = priority[0]["priority"];
    result["admins"] = admins[0]["admins"];
    result["departments"] = departments[0]["departments"];
    result["ticket_admin_status"] = ticket_admin_status[0]["ticket_status"];
    result["ticket_status_mapping"] = ticket_status_mapping[0]["ticket_status"];
    result["ticket_user_status"] = ticket_user_status[0]["ticket_status"];

    return result;

}
exports.update_department = async function (ticket_object) {
    await TicketMaster.findByIdAndUpdate(ticket_object.ticket_id, { $set: { "department": ticket_object.department, "modified_by": ticket_object.modified_by } }, { upsert: true }, function (err) {
        if (err) {
            console.log(err);
        }
    });
    return true;
}
exports.get_ticket_histroy = async function (tickecode) {
    return  await ticket_histroy.aggregate([

        {
            $match: {
                "ticket_code":tickecode
            }
        },
    ]);

}
exports.update_ticket_detail = async function (ticket_object) {
    console.log(ticket_object.status)
    var ticket_id = ticket_object.ticket_id;
    
    delete ticket_object["ticket_id"];
    delete ticket_object["department_change"];
    delete ticket_object["ticket_id"];
    ticket_object.assigned_on = new Date();
    if(ticket_object["status"]=='Assigned'){
        delete ticket_object["addressed_on"];
        delete ticket_object["tentative_closed_on"];
    }
    if (ticket_object["approved_by"])
        ticket_object["approved_by"] = ticket_object["approved_by"]["employee_number"];
    await TicketMaster.findByIdAndUpdate(ticket_id, { $set: ticket_object }, { upsert: true }, function (err) {
        if (err) {
            console.log(err);
        }
        else{
           // ticket_master_save_object.save()
          // console.log(result)
           if(ticket_object.status!='Assigned')
           {
               var result=[];
            TicketMaster.findOne({"_id":ObjectID(ticket_id)},function (error, response) {
                var ticket_code=response.ticket_code;
                var status=ticket_object.status;
                var admin_description=response.admin_description;
                var assigned_to=response.assigned_to;
                var created_by=response.created_by
              //  result.push(created_by,assigned_to,status);
    
                var save_object = new ticket_histroy({ticket_code,status,admin_description})
                return   save_object.save()
              
    
            })

           }
       
        }

    });
    return true;
}

exports.get_request_list = async function (employee_id) {
    return await TicketMaster.aggregate([
        {
            $match: {
                "approved_by": employee_id,
                "deleted": false
            }
        },
    ]);
}

exports.get_overall_admin_list = async function (employee_id) {
    return await ConfigurationValue.aggregate([
        {
            $match: {
                "key": "admins",
                "deleted": false
            }
        },
        {
            $project: {
                "_id": 0,
                "admins": "$value"
            }
        }
    ]);
}

exports.update_employee_ticket_detail = async function (ticket_object) {   
    await TicketMaster.findByIdAndUpdate(ticket_object.ticket_id, { $set: {closed_reason:ticket_object.closed_reason,status:ticket_object.feedback_status,modified_by:ticket_object.modified_by,modified_on:new Date()} }, { upsert: true }, function (err) {      
        if (err) {
            console.log(err);
        }
    });
    return  await TicketMaster.aggregate([

        {
            $match: {
                "_id": ObjectId(ticket_object.ticket_id)
            }
        },
    ]);;
}
exports.update_employee_ticket_detail_description = async function (ticket_object) { 
    console.log(ticket_object)  
    return await TicketMaster.updateOne(
        {_id:ObjectId(ticket_object.ticket_id)}, //find criteria
        // this row contains fix with $set oper
        { $set : { description:ticket_object.value}}); 
}
exports.delete_objectid = async function (ticket_object) { 
   
     await TicketMaster.updateOne(
        {_id:ObjectId(ticket_object.ticket_id)}, //find criteria
        // this row contains fix with $set oper
        { $set : { deleted:"true"}}); 
        return  await TicketMaster.aggregate([

            {
                $match: {
                    "_id": ObjectId(ticket_object.ticket_id)
                }
            },
        ]);;
}