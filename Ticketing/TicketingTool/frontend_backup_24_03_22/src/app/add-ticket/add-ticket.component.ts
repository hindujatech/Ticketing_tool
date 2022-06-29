import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TicketService } from '../services';
import { LoaderService } from '../shared/loader.subject'
import { Router } from '@angular/router';
import { PushNotificationService } from "../services/push_notification.service";
import { FileValidator } from 'ngx-material-file-input';


@Component({
  selector: 'app-add-ticket',
  templateUrl: './add-ticket.component.html',
  styleUrls: ['./add-ticket.component.css']
})
export class AddTicketComponent implements OnInit {
  @Input() ticket_type;
  row_form_data: any;
  departments: any = [];
  maxSize: number = 2097152;
  behalf_of_name: any = '';
  employee_data:any=[];

  constructor(private push_notification_service: PushNotificationService, private ticket_service: TicketService, private loader_subject: LoaderService, private router: Router, ) { }
  ngOnInit() {

    // temporary emp list
    this.employee_data=[
      {name: 'Krish', id: 16790},
      {name: 'Hariharan', id: 17753},
      {name: 'Shwetha', id: 18556},
      {name: 'Balaji', id: 18529},
    ]
    this.behalf_of_name = this.employee_data; 

    this.ticket_service.getDepartments()
      .subscribe(
        response => {
          this.departments = response;
        }
      );
    this.row_form_data = new FormGroup({
      subject: new FormControl("", [Validators.required]),
      description: new FormControl("", [Validators.required]),
      department: new FormControl("", [Validators.required]),
      onBehalfOf: new FormControl("", [Validators.required]),
      onBehalfOf_search: new FormControl(),
      attachment: new FormControl("", [FileValidator.maxContentSize(this.maxSize)]
      ),
    });
    this.row_form_data.controls["onBehalfOf"].setValue([]);
    this.row_form_data.controls.onBehalfOf_search.valueChanges
    .subscribe(() => {
      this.update_competency();
    });
  }
  add_ticket() {
    if (this.row_form_data.status == 'VALID') {
      this.loader_subject.setLoader(true)
      var jsonObj = JSON.parse(localStorage.currentUser);
      this.row_form_data.value.created_by = jsonObj.data.employee_number;
      const formData = new FormData();
      if (this.row_form_data.value.attachment)
        formData.append("file", this.row_form_data.value.attachment.files[0]);
      delete this.row_form_data.value.attachment;
      Object.keys(this.row_form_data.value).forEach((key) => {
        formData.append(key, this.row_form_data.value[key]);
      });
      this.ticket_service.addTicket(jsonObj.data.work_email_address, formData)
        .subscribe(
          response => {
            this.push_notification_service.emitEventOnEmployeeCreateTicket({ "ticket_code": response["data"]["ticket_code"], "show_employee_id": jsonObj.data.employee_number, "first_name": jsonObj.data.givenName });
            this.router.navigateByUrl('/add_ticket', { skipLocationChange: true }).then(() => {
              this.router.navigate(["employee_dashboard"]);
              this.loader_subject.setLoader(false)
            });
          }
        );
    }
  }
  OnDestroy() {
    this.loader_subject.setLoader(false)
  }

  update_competency(){
    var competency = this.row_form_data.controls.onBehalfOf_search.value
    const filterValue = competency.toLowerCase();
    this.behalf_of_name = this.employee_data.filter(competency => {
      return competency.name.toLowerCase().includes(filterValue)
    })
  }
  
}
