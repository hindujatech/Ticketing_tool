import { Component, OnInit, ViewChild, Input, Output, EventEmitter,ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { TicketService } from '../services';
import { MatSidenav } from '@angular/material/sidenav';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LoaderService } from '../shared/loader.subject';
import { ActivatedRoute,Router} from '@angular/router';


@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
 


})
export class EmployeeDashboardComponent implements OnInit {
  // view: any[] = [500, 250];
  @Input() viewList : Boolean;
  
  view_type: any;
  view: any[] = [500, 250];
  add_nav: Boolean = true;
  view_nav: Boolean = true;
  ticket_status_data: any;
  overall_ticket: any;
  @Output() ticket_depatment_data: any;
  @Output() status_mapping: any;
  ticket_graph: any[];
  ticket_bar: any[];
  showLegend = true;
  @Output() over_all_department_data: any;
  @Output() selected_ticket_id: any;
  load_dashboard_table: Boolean = false;
  departments: any = [];
  user_object: any = [];
  gauge_max: Number;
  @ViewChild('child_sidenav') child_sidenav: MatSidenav;
 // yScaleMax=this.gauge_max
 yScaleMax=50;
  yAxisTicks=[0,10,20,30,40,50,60];



  ColorScheme = [
    { name: 'Facilities', value: '#980064' },
    { name: 'Finance', value: '#026100' },
    { name: 'HR', value: '#8dad00' },
    { name: 'Internal IT-Application Support', value: '#bb5400' },
    { name: 'IT-Infrastructure', value: '#189494' },
    { name: 'Quality', value: '#009a84' },
    { name: 'Open', value: '#1948f3' },
    { name: 'Processing', value: '#f37419' },
    { name: 'Waiting For Feedback', value: '#9411f7' },
    { name: 'Closed', value: '#4eb96e' },
  ];



  constructor(private loader_subject: LoaderService,private ticket_service: TicketService,private router: Router) { this.viewList = false; }



  ngOnInit() {
    this.user_object = JSON.parse(localStorage.currentUser);

    this.ticket_service.employeeDashboard(this.user_object.data.employee_number)
      .subscribe(
        response => {
         
          this.ticket_status_data = response["data"]["status"];
        console.log(this.ticket_status_data.Open)
          if(this.ticket_status_data.Assigned!=0)
          {
            if(this.ticket_status_data.Open==undefined)
            {
              this.ticket_status_data.Open=0
              this.ticket_status_data.Open=  this.ticket_status_data.Assigned+this.ticket_status_data.Open
            console.log(this.ticket_status_data.Open)
            }
            else if(this.ticket_status_data.Open!=undefined){
              if(this.ticket_status_data.Assigned==undefined)
              {
                this.ticket_status_data.Assigned=0
              }
              this.ticket_status_data.Open=  this.ticket_status_data.Assigned+this.ticket_status_data.Open
              console.log(this.ticket_status_data.Open)
            }
            
          }
          if(this.ticket_status_data.Waiting_For_Approval)
          {
            if(this.ticket_status_data.Processing==undefined)
            {
              this.ticket_status_data.Processing=0
              this.ticket_status_data.Processing=  this.ticket_status_data.Waiting_For_Approval+this.ticket_status_data.Processing
            //console.log(this.ticket_status_data.Processing)
            }
            else if(this.ticket_status_data.Processing!=undefined){
              if(this.ticket_status_data.Waiting_For_Approval==undefined)
              {
                this.ticket_status_data.Waiting_For_Approval=0
              }
              this.ticket_status_data.Processing=  this.ticket_status_data.Waiting_For_Approval+this.ticket_status_data.Processing
              //console.log(this.ticket_status_data.Processing)
            }
            
           
          }
          if(this.ticket_status_data.Work_Around)
          {
            if(this.ticket_status_data.Processing==undefined)
            {
              this.ticket_status_data.Processing=0
              this.ticket_status_data.Processing=  this.ticket_status_data.Work_Around+this.ticket_status_data.Processing
              //console.log(this.ticket_status_data.Work_Around)
            }
            else if(this.ticket_status_data.Processing!=undefined){
              if(this.ticket_status_data.Work_Around==undefined)
              {
                this.ticket_status_data.Work_Around=0
                
              this.ticket_status_data.Processing=  this.ticket_status_data.Work_Around+this.ticket_status_data.Processing
              }
              //console.log(this.ticket_status_data.Work_Around)         
            
            }
            
          }
          if(this.ticket_status_data.Reopened)
          {
            this.ticket_status_data.Open=  this.ticket_status_data.Reopened+this.ticket_status_data.Open
            //console.log(this.ticket_status_data.Work_Around)
          }


          // this.overall_ticket = Number(this.ticket_status_data.Open) + Number(this.ticket_status_data.Processing) + Number(this.ticket_status_data.Closed);
          this.ticket_depatment_data = response["data"]["department_table"];
          this.over_all_department_data = response["data"]["over_all"];
          this.ticket_graph = response["data"]["department_graph"];
          this.ticket_bar = response["data"]["department_bar"];
          this.departments = response["data"]["departments"];
          this.status_mapping = response["data"]["status_configuration"];
          this.gauge_max = parseInt(this.over_all_department_data.length);
          this.load_dashboard_table = true;
       // this.yScaleMax=this.gauge_max;
         // console.log(this.yScaleMax)
         
        }
      );
  }
  pieChartLabel(ticket_graph: any[], name: string): string {
    const item = ticket_graph.filter(data => data.name === name);
    if (item.length > 0) {
        return item[0].label;
    }
    return name;
}
  onChange(data) {
    this.loader_subject.setLoader(true)
    this.view_type = data.type;
    this.selected_ticket_id = data.ticket_id
    this.child_sidenav.open();
    this.loader_subject.setLoader(false)
  }
  onSelect(data) {
    console.log(data);
  }
Click_close(ticket_id)
  {
    alert(ticket_id)
  }

}

@Component({
  selector: 'dashboard-table',
  templateUrl: 'dashboard-table.html',
  styleUrls: ['./employee-dashboard.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('200ms cubic-bezier(0.1, 0.1, 0.1, 0.1)')),
    ]),
  ]
})
export class DashBoardTable {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ticket_data: any = [];
  @Input() table_data: any[];
  @Input() status_mapping: any;
  @Input() employee_detail: any[];
  @Input() type: String;
  @Input() disable_edit: Boolean;
  @Input() viewList: Boolean;
  @Input() admin_dashboard: Boolean = true;
  @Input() disable_department: Boolean;
  @Input() created_by: Boolean;
  @Input() selected_department: any;
  @Output() ticket_detail = new EventEmitter<any>();
  displayedColumns: string[]
  constructor(private loader_subject: LoaderService,private ticket_service: TicketService,private router: Router) { this.viewList = false; }
 
  ngOnInit() {
    this.ticket_data.filterPredicate = 
  (data: Element, filter: string) => data['created_by'].employee_name.indexOf(filter) != -1;

    if (this.type == 'overall' && !this.disable_department)
      this.displayedColumns = ['ticket_code','department', 'status', 'action'];
    else
      this.displayedColumns = ['ticket_code', 'status', 'action'];

    if (this.created_by)
      this.displayedColumns.splice(1, 0, "created_by");

    this.ticket_data = new MatTableDataSource<any>(this.table_data);
    this.ticket_data.paginator = this.paginator;
    this.ticket_data.sort = this.sort;
    
  }
  show_edit() {
   
  }
  
  applyFilter(filterValue: string) {
    console.log(filterValue)
    const tableFilters = [];
    tableFilters.push({
      id: 'ticket_code',
      value: filterValue.trim().toLowerCase()
    },{
      id: 'created_by',
      value: filterValue.trim().toLowerCase()
    },
    {
      id: 'department',
      value: filterValue.trim().toLowerCase()
    },
    {
      id: 'status',
      value: filterValue.trim().toLowerCase()
    });
    this.ticket_data.filter = JSON.stringify(tableFilters);
    this.ticket_data.filter = filterValue.trim().toLowerCase();
  }
  onClick(ticket_id, type): void {
    console.log("saasdas",ticket_id,type)
    if(type!="cancel")
    {
      this.ticket_detail.emit({ ticket_id, type });
    }
    else{
      //alert(ticket_id)
      this.ticket_service.delteobjectid(ticket_id)
      .subscribe(
        response => {
          this.router.navigateByUrl('/add_ticket', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/employee_dashboard'], { queryParams: { department: this.selected_department } });
          });
          this.loader_subject.setLoader(false)
        });

    }
    
  }
  show_icon(edit){
    

  }
}

