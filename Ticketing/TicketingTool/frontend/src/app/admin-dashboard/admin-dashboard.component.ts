import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { TicketService } from '../services';
import { MatSidenav } from '@angular/material/sidenav';
import { LoaderService } from '../shared/loader.subject'
import { MatDialog } from '@angular/material';
import { TicketDialog } from '../employee-dashboard/employee-dashboard.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  view_type: any;
  view: any[] = [500, 250];
  view_nav: Boolean = true;
  ticket_status_data: any;
  overall_ticket: any;
  @Output() ticket_depatment_data: any;
  ticket_graph: any[];
  ticket_bar: any[];
  showLegend = true;
  @Output() over_all_department_data: any;
  @Output() selected_ticket_id: any;
  @Output() selected_department: any;
  load_dashboard_table: Boolean = false;
  departments: any = [];
  user_object: any = [];
  gauge_max :Number =100;
  @Output() employee_detail: any = [];
  @ViewChild('child_sidenav') child_sidenav: MatSidenav;
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  
  showXAxisLabel = false;
  
  showYAxisLabel = false;



  ColorScheme = [
    { name: 'Facilities', value: '#980064' },
    { name: 'Finance', value: '#026100' },
    { name: 'HR', value: '#8dad00' },
    { name: 'Internal IT-Application Support', value: '#bb5400' },
    { name: 'IT-Infrastructure', value: '#bb5400' },
    { name: 'Quality', value: '#009a84' },
    { name: 'Open', value: '#1948f3' },
    { name: 'Processing', value: '#f37419' },
    { name: 'Assigned', value: '#f31974' },
    { name: 'Waiting For Approval', value: '#19a9d4' },
    { name: 'Closed', value: '#9411f7' },
    // { name: 'Work Around', value: '#adaf24' },
    { name: 'Confirm', value: '#4eb96e' },
  ];



  constructor(private ticket_service: TicketService, private loader_subject: LoaderService, public dialog: MatDialog,) { }

  ngOnInit() {
    this.user_object = JSON.parse(localStorage.currentUser);

    this.ticket_service.superAdminDashboard()
      .subscribe(
        response => {
          this.ticket_status_data = response["data"]['ticket_data']["status"];
          this.ticket_depatment_data = response["data"]['ticket_data']["department_table"]; 
          this.over_all_department_data = response["data"]['ticket_data']["over_all"];
          this.ticket_graph = response["data"]['ticket_data']["department_graph"];
          this.ticket_bar = response["data"]['ticket_data']["department_bar"];
          this.departments = response["data"]['ticket_data']["departments"];
          this.employee_detail = response["data"]["employee_detail"];
          this.load_dashboard_table = true;
          this.gauge_max= this.over_all_department_data.length

          // this.ticket_bar.forEach(function(o) {
          //   o.series = o.series.filter(element => element.name !=  "Closed" && element.name !=  "Open");
          // });
          // console.log(this.ticket_bar);
        }
      );
     
  }
  onChange(data) {
    this.loader_subject.setLoader(true)
    this.view_type = data.type;
    this.selected_ticket_id = data.ticket_id;
    this.child_sidenav.open();
    this.loader_subject.setLoader(false)
  }
  onSelect(data) {
    console.log(data);
  }

  openDialog(item: any): void {
    console.log(this.employee_detail)
    const dialogRef = this.dialog.open(TicketDialog, {
      data: {
        value:this.over_all_department_data,
        status: item,
        componentName: 'department',
        employee_detail: this.employee_detail
      }, 
      maxHeight: '600px',
      width: '1250px',
      disableClose: true
    })
  }
}
