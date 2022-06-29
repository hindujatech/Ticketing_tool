import { Component, OnInit, Input } from '@angular/core';
import { TicketService } from '../services';
import { BACK_END_URL } from '../shared/app.globals';
import { LoaderService } from '../shared/loader.subject'
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-employee-ticket-edit',
  templateUrl: './employee-ticket-edit.component.html',
  styleUrls: ['./employee-ticket-edit.component.css']
})
export class EmployeeTicketEditComponent implements OnInit {
  ticket_detail: any = [];
  employee_detail: any = [];
  attachment: string = '';
  form_data: any;
  open_reason:string;
  @Input() ticket_id: any;
  @Input() selected_department: any;
  constructor(private router: Router, private loader_subject: LoaderService, private ticket_service: TicketService) { }
  ngOnChanges() {
    this.update_table_detail();
  }
  ngOnInit() {
  
  }

  update_table_detail() {

    this.form_data = new FormGroup({
      closed_reason: new FormControl("", [Validators.required]),
      feedback_status: new FormControl("", [Validators.required])
    });

    this.ticket_service.getTicketDetail(this.ticket_id)
      .subscribe(
        response => {
          this.ticket_detail = response["data"]["ticket_detail"]["ticket_detail"];
          console.log(this.ticket_detail);
          this.employee_detail = response["data"]["employee_detail"];
          if (this.ticket_detail["attachment"])
            this.attachment = BACK_END_URL + "attachments/" + this.ticket_detail["attachment"];
        }
      );
    this.loader_subject.setLoader(false)
  }

  onSubmit() {
        if (this.form_data.valid) {
      this.loader_subject.setLoader(true)
      var form_ticket_detail = this.form_data.value;
      form_ticket_detail.ticket_id = this.ticket_id;
     
      var jsonObj = JSON.parse(localStorage.currentUser);
      form_ticket_detail.modified_by = jsonObj.data.employee_number;
      console.log(form_ticket_detail);
      this.ticket_service.saveEmployeeTicketEdit(form_ticket_detail)
        .subscribe(
          response => {
            this.router.navigateByUrl('/add_ticket', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/employee_dashboard'], { queryParams: { department: this.selected_department } });
            });
            this.loader_subject.setLoader(false)
          });
    }
  }
  
  OnDestroy() {
    this.loader_subject.setLoader(false)
  }
  
}

