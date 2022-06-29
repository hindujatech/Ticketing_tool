var express = require('express')

var router = express.Router()

// Getting the User Controller that we just created

var AddTicketController = require('../controllers/add_ticket.controller');



router.post('/create_ticket/:mail', AddTicketController.create_ticket)

router.get('/employee_dashboard/:employee_id', AddTicketController.employee_dashboard)

router.get('/get_departments/', AddTicketController.get_departments)

router.post('/profile_pic_upload/:employee_id', AddTicketController.profile_pic_upload)

router.post('/edit_information/:employee_id', AddTicketController.edit_information)

router.get('/department_admin_dashboard/:department', AddTicketController.department_admin_dashboard)

router.get('/super_admin_dashboard/', AddTicketController.super_admin_dashboard)

router.get('/get_ticket_detail/:ticket_id', AddTicketController.get_ticket_detail)

router.get('/get_filtered_employee_list/:filtered_value', AddTicketController.get_filtered_employee_list)

router.post('/save_admin_ticket_edit/', AddTicketController.save_admin_ticket_edit)

router.post('/save_employee_ticket_edit/', AddTicketController.save_employee_ticket_edit)

router.get('/get_request_list/:employee_id', AddTicketController.get_request_list)
router.post('/send_assgned_mail/:employee_id', AddTicketController.sendassgned_mail)
router.post('/targetsubdepartments/', AddTicketController.target_subdepartments)
router.post('/get_rm_data/', AddTicketController.getrm_data)
router.get('/export/:department', AddTicketController.getticket_export)
router.post('/update_description/', AddTicketController.table_update_description)
router.post('/delete_objectid/', AddTicketController.ticketmaster_delete_id)
router.get('/get_all_employee_details/', AddTicketController.get_all_employee_details);
router.get('/get_overall_admin_list/', AddTicketController.get_overall_admin_list);







// Export the Router
module.exports = router;