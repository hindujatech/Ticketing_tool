import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BACK_END_URL } from '../shared/app.globals';

@Injectable()
export class TicketService {
    constructor(private http: HttpClient) { }
    addTicket(mail, save_data) {
        return this.http.post(BACK_END_URL + `ticketing_tool/create_ticket/` + mail, save_data);
    }
    employeeDashboard(employee_id) {
        return this.http.get(BACK_END_URL + `ticketing_tool/employee_dashboard/` + employee_id);
    }
    departmentAdminDashboard(department) {
        return this.http.get(BACK_END_URL + `ticketing_tool/department_admin_dashboard/` + department);
    }
    superAdminDashboard() {
        return this.http.get(BACK_END_URL + `ticketing_tool/super_admin_dashboard/`);
    }
    getDepartments() {
        return this.http.get(BACK_END_URL + `ticketing_tool/get_departments/`);
    }
    profilePicUpload(file, employee_id) {
        return this.http.post(BACK_END_URL + `ticketing_tool/profile_pic_upload/` + employee_id, file);
    }
    editInformation(save_data, employee_id) {
        return this.http.post(BACK_END_URL + `ticketing_tool/edit_information/` + employee_id, save_data);
    }
    getTicketDetail(ticket_id) {
        return this.http.get(BACK_END_URL + `ticketing_tool/get_ticket_detail/` + ticket_id);
    }
    getFilteredEmployeeList(filtered_value) {
        return this.http.get(BACK_END_URL + `ticketing_tool/get_filtered_employee_list/` + filtered_value);
    }
    saveAdminTicketEdit(ticket_detail) {
        return this.http.post(BACK_END_URL + `ticketing_tool/save_admin_ticket_edit/`, ticket_detail);
    }
    saveEmployeeTicketEdit(ticket_detail) {
        return this.http.post(BACK_END_URL + `ticketing_tool/save_employee_ticket_edit/`, ticket_detail);
    }
    getRequestList(employee_id) {
        return this.http.get(BACK_END_URL + `ticketing_tool/get_request_list/` + employee_id);
    }
    sendAssignedmail(assigned,employee_id,ticket_code)
    {
      
        console.log(assigned)
        var body={
            assigned:assigned,
            ticket_code:ticket_code
            
        }
        return this.http.post(BACK_END_URL + `ticketing_tool/send_assgned_mail/`+ employee_id,body);
    }
    target_subdepartments(Departments)
    {
      
        console.log(Departments)
        var body={
            department:Departments
            
        }
        return this.http.post(BACK_END_URL + `ticketing_tool/targetsubdepartments/`,body);
    }

    getrmdetails(employee_data)
    {
      
        console.log(employee_data)
        var body={
            department:employee_data
            
        }
        return this.http.post(BACK_END_URL + `ticketing_tool/get_rm_data/`,body);
    }
    ticket_export(department){
        return this.http.get(BACK_END_URL + `ticketing_tool/export/`+ department,{
            responseType : 'blob'});

    }
    update_ticket_desription(ticket_id,value) {
        var body={
            'ticket_id':ticket_id,
            value:value
        }
        return this.http.post(BACK_END_URL + `ticketing_tool/update_description/`,body);

      
        // return this.http.get(BACK_END_URL + `ticketing_tool/super_admin_dashboard/`);
    }
    delteobjectid(ticket_id)
    {
        var body={
            "ticket_id":ticket_id

    }
        return this.http.post(BACK_END_URL + `ticketing_tool/delete_objectid/`,body);
    }

}