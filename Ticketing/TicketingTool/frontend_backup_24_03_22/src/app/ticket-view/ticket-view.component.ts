import { Component, EventEmitter, Output, OnInit, Input, OnChanges } from '@angular/core';
import { TicketService } from '../services';
import { BACK_END_URL } from '../shared/app.globals';
import { LoaderService } from '../shared/loader.subject'
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.css']
})
export class TicketViewComponent implements OnInit {
  ticket_detail: any = [];
  employee_detail: any = [];
  attachment: string = '';

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
          this.employee_detail = response["data"]["employee_detail"];
          if (this.ticket_detail["attachment"])
            this.attachment = BACK_END_URL + "attachments/" + this.ticket_detail["attachment"];
        }
      );
    this.loader_subject.setLoader(false)
  }
  
  OnDestroy() {
    this.loader_subject.setLoader(false)
  }
  

}
