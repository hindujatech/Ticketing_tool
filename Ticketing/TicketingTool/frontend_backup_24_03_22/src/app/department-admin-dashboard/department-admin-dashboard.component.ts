import { Component, OnInit, ViewChild, Output,Input, } from '@angular/core';
import { TicketService } from '../services';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute,Router} from '@angular/router';
import { LoaderService } from '../shared/loader.subject'

@Component({
  selector: 'app-department-admin-dashboard',
  templateUrl: './department-admin-dashboard.component.html',
  styleUrls: ['./department-admin-dashboard.component.css']
})
export class DepartmentAdminDashboardComponent implements OnInit {
  viewList : Boolean;
  view_type: any;
  view: any[] = [500, 250];
  //admin_dashboard:boolean=false;
   admin_dashboard: Boolean=false;
  view_nav: Boolean = true;
  show_child_nav: Boolean = true;
  ticket_status_data: any;
  overall_ticket: any;
  @Output() ticket_depatment_data: any;
  ticket_graph: any[];
  ticket_bar: any[];
  showLegend = true;
  gauge_max: Number = 100;
  @Output() selected_ticket_id: any;
  @Output() selected_department: any;
  @Output() over_all_department_data: any;
  load_dashboard_table: Boolean = false;
  // departments: any = [];
  user_object: any = [];
  @Output() employee_detail: any = [];
  @ViewChild('child_sidenav') child_sidenav: MatSidenav;
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  
  showXAxisLabel = true;
  
  showYAxisLabel = true;
  xAxisLabel = "Engineer's Id";
  //showYAxisLabel = true;
  yAxisLabel = 'No of tickets assigned ';
  XAxisLabel: string = "Engineer's Id";
  
  YAxisLabel: string = 'Ticket status count';
  yScaleMax=this.gauge_max




  ColorScheme = [
    { name: 'Open', value: '#1948f3' },
    { name: 'Processing', value: '#f37419' },
    { name: 'Assigned', value: '#f31974' },
    { name: 'Waiting For Approval', value: '#19a9d4' },
    { name: 'Closed', value: '#9411f7' },
    { name: 'Confirm', value: '#4eb96e' },
  ];



  constructor(private ticket_service: TicketService, private loader_subject: LoaderService, private route: ActivatedRoute,private router: Router, ) {this.viewList = false; }

  ngOnInit() {
    this.user_object = JSON.parse(localStorage.currentUser);
    this.selected_department = this.route.snapshot.queryParams['department'];
    this.ticket_service.departmentAdminDashboard(this.route.snapshot.queryParams['department'])
      .subscribe(
        response => {
          this.ticket_status_data = response["data"]['ticket_data']["status"];
          this.ticket_depatment_data = response["data"]['ticket_data']["department_table"];
          this.over_all_department_data = response["data"]['ticket_data']["over_all"];
          this.gauge_max = this.over_all_department_data.length
          this.ticket_graph = response["data"]['ticket_data']["department_graph"];
          this.ticket_bar = response["data"]['ticket_data']["department_bar"];
          this.employee_detail = response["data"]["employee_detail"];
          this.load_dashboard_table = true;

          console.log(this.employee_detail);

          console.log(response);
        }
       
      );
     
  }
  onChange(data) {
    this.loader_subject.setLoader(true)
    this.view_type = data.type;
    this.selected_ticket_id = data.ticket_id
    this.child_sidenav.open();
    this.loader_subject.setLoader(false)
  }
  

  OnDestroy() {
    this.loader_subject.setLoader(false)
  }
  // onSelect(data) {
  //   console.log(data);
  // }

}
