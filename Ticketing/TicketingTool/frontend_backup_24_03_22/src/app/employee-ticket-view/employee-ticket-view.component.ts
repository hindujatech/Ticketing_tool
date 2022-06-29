import { Component, OnInit, Input } from '@angular/core';
import { TicketService } from '../services';
import { BACK_END_URL } from '../shared/app.globals';
import { LoaderService } from '../shared/loader.subject'
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-ticket-view',
  templateUrl: './employee-ticket-view.component.html',
  styleUrls: ['./employee-ticket-view.component.css']
})
export class EmployeeTicketViewComponent implements OnInit {
  ticket_detail: any = [];
  employee_detail: any = [];
  attachment: string = '';
  user_description='';

  @Input() ticket_id: any;
  @Input() selected_department: any;
  constructor(private router: Router, private loader_subject: LoaderService, private ticket_service: TicketService) { }
  ngOnChanges() {
    this.update_table_detail();
  }
  ngOnInit() {
  
  }

  update_table_detail() {

    this.ticket_service.getTicketDetail(this.ticket_id)
      .subscribe(
        response => {
          this.ticket_detail = response["data"]["ticket_detail"]["ticket_detail"];
          console.log(this.ticket_detail);
          if(this.ticket_detail.status=="Open")
          {
            this.user_description=this.ticket_detail.description;
          }
          this.employee_detail = response["data"]["employee_detail"];
          if (this.ticket_detail["attachment"])
            this.attachment = BACK_END_URL + "attachments/" + this.ticket_detail["attachment"];
        }
      );
    this.loader_subject.setLoader(false)
  }
  update_description(value)
  {
    var value=value
    this.ticket_service.update_ticket_desription(this.ticket_id,value)
    .subscribe(
      response => {
 
        this.router.navigateByUrl('/add_ticket', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/employee_dashboard'], { queryParams: { department: this.selected_department } });
        });
        this.loader_subject.setLoader(false)
      });
  }
  
  OnDestroy() {
    this.loader_subject.setLoader(false)
  }
  
}
