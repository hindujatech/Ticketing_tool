var createConnection = require('../db');
var mysql = require('mysql');
var md5 = require('md5');

exports.getSelectedEmployeeList = async function (selected_employee_ids, result) {
    //console.log(selected_employee_ids);
    var employee_list_query = 'SELECT employees.work_email_address,employees.mobile_number,employees.employee_number,CONCAT(employee_number," - ",first_name," ",last_name)AS employee_name, bands.name AS band_name,company_structures.name AS sub_unit,CASE WHEN pta.location_table = "company_locations"       THEN CONCAT(cv.configuration_key," - ",hco.country, "- ",hct.city)       WHEN pta.location_table = "customer_work_locations"       THEN CONCAT(custom.customer_name, " - " ,cwl.address_line," - ",cco.country, " - ",cct.city)       ELSE       CONCAT(cv2.configuration_key," - ",hco2.country, "- ",hct2.city)       END AS current_location_name FROM employees INNER JOIN bands ON bands.id=band_id INNER JOIN company_structures ON company_structures.id=employees.structure_name_subgroup LEFT JOIN project_team_allocations AS pta ON(pta.employee_id = employees.id AND pta.deleted=0 AND CURDATE() BETWEEN pta.start_date AND pta.end_date)       LEFT JOIN projects AS prjt ON prjt.id = pta.project_id       LEFT JOIN customer_work_locations AS cwl ON cwl.id = pta.work_location_id       LEFT JOIN company_locations AS cll ON(cll.id = pta.work_location_id)       LEFT JOIN customers AS custom ON custom.id = prjt.customer_id       LEFT JOIN cities hct ON (hct.id = cll.city_id)       LEFT JOIN countries hco ON (hco.id = cll.country_id)       LEFT JOIN configuration_values cv ON (cv.parent_id = "639")       LEFT JOIN cities cct ON (cct.id = cwl.city_id)       LEFT JOIN countries cco ON (cco.id = cwl.country_id)       LEFT JOIN company_structures AS cs ON(cs.id=employees.structure_name)       LEFT JOIN company_locations AS cl ON(cl.id = employees.current_location_id)       LEFT JOIN cities hct2 ON (hct2.id = cl.city_id)       LEFT JOIN countries hco2 ON (hco2.id = cl.country_id)       LEFT JOIN configuration_values cv2 ON (cv2.parent_id = "639") WHERE employees.employee_number IN (?)';
    var employee_ids = [];
    employee_ids.push(selected_employee_ids);
    employee_list_query = mysql.format(employee_list_query, employee_ids)
    try {
        createConnection(function (error, connection) {
            console.log("inside Employee List");
            if (error) {
                console.log("error: ", error);
                result(error, null);
            }
            connection.query(employee_list_query, function (err, res) {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else {
                    try {
                        if (res.length != 0) {
                            var employee_detail = {};
                            for (var emp_data of res) {
                                employee_detail[emp_data.employee_number] = emp_data;
                            }
                            result(null, employee_detail);
                        } else {
                            result(null, {});
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            });
            connection.release();
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.getEmployeeDetail = async function (employee_id, result) {
    var response;
    var start_date;
  
    var employee_details = "SELECT emp.joined_date as joined_date, CONCAT(emp.employee_number,' ',emp.first_name, ' ',emp.last_name) AS employee_name,CONCAT(rm.employee_number,' ',rm.first_name, ' ',rm.last_name) AS manager_name,band.name as band, des.designation as designation,cs.name as unit,css.name as practice,cs.parent_id as sbu_id,csss.name as sub_practice,cv.configuration_value as category, emp.work_email_address,emp.manager FROM employees AS emp  inner join employees as rm  on emp.manager=rm.id inner join bands as band on band.id=emp.band_id    inner join designations as des on des.id=emp.designation_id    inner join company_structures as cs on cs.id=emp.structure_name     inner join company_structures as css on css.id=emp.structure_name_subgroup    left join company_structures as csss on csss.id=emp.structure_name_subpractice    inner join configuration_values as cv on cv.configuration_key=emp.billable and cv.parent_id='52' where emp.id=?    LIMIT 1"
    var employee_experience = "select MIN(start_date) as start_date from dtl_employee_workexperience where employee_id=? and deleted=0"
    var employee_experience_all = " SELECT dew.end_date as end_date FROM employees AS emp LEFT JOIN dtl_employee_workexperience dew ON emp.id=dew.employee_id WHERE dew.employee_id=? AND dew.start_date=(SELECT MAX(start_date) FROM  dtl_employee_workexperience WHERE employee_id=?) AND dew.deleted=0"
    var project_detail = "SELECT PTA.project_id,CONCAT(Project.project_code,'-',Project.project_name) AS project_name, CONCAT(emp.employee_number,'-',emp.first_name,' ',emp.last_name) AS project_manager, PTA.start_date , PTA.end_date FROM project_team_allocations AS PTA INNER JOIN projects AS Project ON (Project.id = PTA.project_id) LEFT JOIN employees AS emp ON(project.project_manager = emp.id) WHERE PTA.employee_id = ? AND CURDATE() BETWEEN PTA.start_date AND PTA.end_date AND PTA.deleted = 0 AND Project.project_status IN ('e') GROUP BY PTA.project_id"
    var overall_experience="select sum(datediff(end_date,start_date)+1) as day_count from dtl_employee_workexperience where employee_id = ? and deleted = 0"
    
    try {
        createConnection(function (error, connection) {
            if (error) {
                console.log("error: ", error);
                result(error, null);
            }
            connection.query(employee_details, employee_id, function (err, res) {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else {
                    try {
                        if (res.length > 0) {
                            if (res[0]["sub_practice"] == null)
                                res[0]["sub_practice"] = res[0]["practice"]
                            if (res[0]["sbu_id"] == 1) {
                                res[0]["practice_lable"] = "Business Unit";
                                res[0]["sub_practice_lable"] = "Practice";
                                res[0]["sub_practice_lable1"] = "Sub Practice";
                            } else if (res[0]["sbu_id"] == 12) {
                                res[0]["practice_lable"] = "Enabling Function";
                                res[0]["sub_practice_lable"] = "Sub Function";
                                res[0]["sub_practice_lable1"] = "Sub Function1";
                            } else if (res[0]["sbu_id"] == 52) {
                                res[0]["practice_lable"] = "Sales";
                                res[0]["sub_practice_lable"] = "Geography/Account";
                                res[0]["sub_practice_lable1"] = "Geography/Account1";
                            }
                        }
                        response = res[0];
                    } catch (e) {
                        console.log(e)
                    }
                }

            }),
                connection.query(employee_experience, employee_id, function (err, res1) {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else {
                        try {
                            start_date = res1[0]['start_date']
                        } catch (e) {
                            console.log(e)
                        }
                        // result(null, res);
                    }

                }),
                // connection.query(employee_experience_all, [employee_id, employee_id], function (err, res2) {

                //     if (err) {
                //         console.log("error: ", err);
                //         result(err, null);
                //     }
                //     else {
                //         try {
                //             if (res2.length == 0)
                //             if(start_date=='' || start_date==null){
                //                 start_date = response["joined_date"];
                //             }
                //                //  console.log(start_date)
                //             response["htl_experience"] = getYearMonth(response["joined_date"]);
                //             response["overall_experience"] = getYearMonth(start_date);
                //             response["overall_experience_month"] = getOverallMonth(start_date);
                //             //console.log(response)
                //         } catch (e) {
                //             console.log(e)
                //         }
                //     }

                // }),
                connection.query(overall_experience, employee_id, function (err, res2) {

                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else {
                        try {
                            if (res2)
                            if(start_date=='' || start_date==null){
                                start_date = response["joined_date"];
                            }
                            response["htl_experience"] = getYearMonth(response["joined_date"]);
                            response["overall_experience"] = getYearMonthOverall(res2[0]['day_count'],response["joined_date"]);
                            response["overall_experience_month"] = getOverallMonth(start_date);
                            //console.log(response)
                        } catch (e) {
                            console.log(e)
                        }
                    }

                }),
                connection.query(project_detail, [employee_id], function (err, res3) {

                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else {
                        try {
                            response["project_detail"] = res3;
                            result(null, response);
                        } catch (e) {
                            console.log(e)
                        }
                    }

                });
            connection.release();
        });
    }
    catch (e) {
        console.log(e);
    }
}

exports.getFliteredEmployeeList = async function (filtered_value, result) {
    var filtered_value = "%" + filtered_value + "%";
    var employee_list_query = 'SELECT employees.employee_number,CONCAT(employees.employee_number," - ",employees.first_name," ",employees.last_name)AS employee_name,bands.name AS band_name,company_structures.name AS unit  FROM employees AS employees  INNER JOIN bands ON bands.id=band_id  LEFT JOIN employees AS rm ON rm.manager = employees.id  LEFT JOIN projects AS prj ON prj.project_manager = employees.id  INNER JOIN company_structures ON company_structures.id=employees.structure_name     WHERE  (employees.employee_number like ? or employees.first_name like ? or employees.last_name like ? ) and employees.employment_status NOT IN ("r","t","b","q","o") AND  (rm.id IS NOT NULL OR prj.id IS NOT NULL) GROUP BY employees.employee_number limit 2';
    try {
        createConnection(function (error, connection) {
            console.log("inside Employee List");
            if (error) {
                console.log("error: ", error);
                result(error, null);
            }
            connection.query(employee_list_query, [filtered_value, filtered_value, filtered_value], function (err, res) {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else {
                    try {
                        if (res.length != 0) {
                            var employee_detail = {};
                            for (var emp_data of res) {
                                employee_detail[emp_data.employee_number] = emp_data;
                            }
                            result(null, employee_detail);
                        } else {
                            result(null, {});
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            });
            connection.release();
        });
    }
    catch (e) {
        console.log(e);
    }
}

exports.login = async function (username, password, result) {
    md5_password = md5(password);
    var valid_user_query = 'SELECT employee_id FROM users inner join employees as emp WHERE emp.employment_status not in ("r","t","b","q","o","y") and username=? and password=? limit 1';
    try {
        createConnection(function (error, connection) {
            if (error) {
                console.log("error: ", error);
                result(error, null);
            }
            connection.query(valid_user_query, [username, md5_password], function (err, res) {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else {
                    try {
                        if (res.length != 0) {
                            var employee_details = 'SELECT employees.id,employees.employee_number,employees.first_name,employees.last_name,employees.middle_name,employees.employment_status,employees.employee_type,employees.band_id,employees.designation_id,employees.manager,employees.structure_name,employees.structure_name_subgroup,employees.structure_name_subpractice,employees.joined_date,employees.company_location_id,employees.gender,employees.marital_status,employees.date_of_marriage,employees.billable,employees.mobile_number,employees.work_email_address,employees.pan_number,employees.personal_email_address,employees.work_phone_number,employees.personal_email_address,employees.current_location_id,employees.title,employees.highest_qualification,bands.name as band_name, designations.designation as designation_name, company_locations.address_line1 FROM employees inner join bands on bands.id=employees.band_id inner join designations on designations.id=employees.designation_id inner join company_locations on company_locations.id=employees.current_location_id  WHERE employees.id=? limit 1';
                            //var employee_details = 'SELECT employees.*,bands.name as band_name, designations.designation as designation_name FROM employees inner join bands on bands.id=employees.band_id inner join designations on designations.id=employees.designation_id  WHERE employees.id=? limit 1';
                            // var employee_details = "SELECT emp.id as id,emp.employee_number,emp.first_name, emp.last_name,rm.id AS manager_id,band.name as band, des.designation as designation,cs.name as unit,css.name as practice,cs.parent_id as sbu_id,csss.name as sub_practice,cv.configuration_value as category FROM employees AS emp  inner join employees as rm  on emp.manager=rm.id inner join bands as band on band.id=emp.band_id    inner join designations as des on des.id=emp.designation_id    inner join company_structures as cs on cs.id=emp.structure_name     inner join company_structures as css on css.id=emp.structure_name_subgroup    left join company_structures as csss on csss.id=emp.structure_name_subpractice    inner join configuration_values as cv on cv.configuration_key=emp.billable and cv.parent_id='52' where emp.id=?    LIMIT 1"
                            connection.query(employee_details, res[0]["employee_id"], function (err, res1) {
                                if (err) {
                                    console.log("error: ", err);
                                    result(err, null);
                                }
                                else {
                                    var is_manager = 'SELECT id from employees where employment_status not in ("r","t","b","q","o") and manager=?';
                                    connection.query(is_manager, res[0]["employee_id"], function (err, res2) {
                                        if (err) {
                                            console.log("error: ", err);
                                            result(err, null);
                                        }
                                        else {
                                            if (res2.length != 0)
                                                res1[0]["is_manager"] = true;
                                            else
                                                res1[0]["is_manager"] = false;

                                            result(null, res1[0]);
                                        }
                                    });
                                }
                            });
                        } else {
                            result(null, {});
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            });
            connection.release();
        });
    }
    catch (e) {
        console.log(e);
    }

}

exports.getReporteeList = async function (manager_id, result) {
    var employee_list = 'SELECT employees.id,concat(employee_number," - ",first_name," ",last_name)as employee_name, bands.name as band_name,company_structures.name as unit FROM employees INNER JOIN bands ON bands.id=band_id inner join company_structures on company_structures.id=employees.structure_name   WHERE employment_status NOT IN ("r","t","b","q","o") AND manager=?';
    try {
        createConnection(function (error, connection) {
            console.log("inside Reportee");
            if (error) {
                console.log("error: ", error);
                result(error, null);
            }
            connection.query(employee_list, [manager_id], function (err, res) {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else {
                    try {
                        if (res.length != 0) {
                            var employee_detail = {};
                            for (var emp_data of res) {
                                employee_detail[emp_data.id] = emp_data;
                            }
                            result(null, employee_detail);
                        } else {
                            result(null, {});
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            });
            connection.release();
        });
    }
    catch (e) {
        console.log(e);
    }
}


exports.geRRFCreationDetail = async function(result) {
    var response = {};
    var employee_list_query = 'SELECT employees.id,work_email_address as Email_id,employees.gender,employees.mobile_number,concat(employee_number," - ",first_name," ",last_name)as itemName FROM employees INNER JOIN bands ON bands.id=band_id inner join company_structures on company_structures.id=employees.structure_name     WHERE employment_status NOT IN ("r","t","b","q","o")';
    // var customers_query = 'SELECT id,concat(customer_code," - ",customer_name) as customer_name FROM customers WHERE deleted=0 and status="a" ORDER BY customers.customer_name';
    // var customers_query = 'SELECT id,concat(customer_code," - ",customer_name, " - ", division) as customer_name FROM customers WHERE deleted=0 and status="a" and division != "" ORDER BY customers.customer_name';
    var customers_query = 'SELECT id,CONCAT(customer_code," - ",customer_name," ",COALESCE(division, "")) AS customer_name FROM customers WHERE deleted=0 AND STATUS="a" ORDER BY customers.customer_name';
    var work_location_query = 'SELECT name FROM work_locations WHERE parent_id=0 order by name';
    var base_location_query = 'SELECT cl.id as id,ci.city,CONCAT(cl.address_line1,", ",r.region,", ",c.country,", ",ci.city) as name FROM company_locations AS cl INNER JOIN countries AS c ON c.id=cl.country_id INNER JOIN regions AS r ON r.id=cl.region_id INNER JOIN cities AS ci ON ci.id=cl.city_id WHERE deleted=0 order by ci.city';
    var band_query = 'SELECT child.id,child.name FROM bands AS parent INNER JOIN bands AS child ON child.parent_id=parent.id WHERE parent.parent_id IS NULL ORDER BY child.sort_order DESC';
    var manager_list_query = 'SELECT employees.id,concat(employee_number," - ",first_name," ",last_name)as employee_name, bands.name as band_name,company_structures.name as unit FROM employees INNER JOIN bands ON bands.id=band_id inner join company_structures on company_structures.id=employees.structure_name     WHERE employment_status NOT IN ("r","t","b","q","o")';

    try {
        createConnection(function(error, connection) {
            if (error) {
                console.log("error: ", error);
                result(error, null);
            }
            connection.query(manager_list_query, function(err, res) {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    } else {
                        if (res.length != 0) {
                            var employee_detail = {};
                            for (var emp_data of res) {
                                employee_detail[emp_data.id] = emp_data;
                            }
                            response['managers'] = employee_detail;
                        } else {
                            response['managers'] = {};

                        }
                    }
                }),
                connection.query(employee_list_query, function(err, res) {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    } else {
                        response['employees'] = res;
                    }
                }),
                connection.query(customers_query, function(err, res) {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    } else {
                        response['customer'] = res;
                    }
                }),
                connection.query(work_location_query, function(err, res) {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    } else {
                        response['work_location'] = res;
                    }
                }),
                connection.query(band_query, function(err, res) {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    } else {
                        response['band'] = res;
                    }
                }),
                connection.query(base_location_query, function(err, res) {
                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    } else {
                        response['base_location'] = res;
                        result(null, response);
                    }
                })

            connection.release();

        });
    } catch (e) {
        console.log(e);
    }
}