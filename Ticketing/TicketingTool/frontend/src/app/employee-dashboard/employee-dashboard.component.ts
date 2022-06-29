import { Component, OnInit, ViewChild, Input, Output, EventEmitter,ViewEncapsulation, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { TicketService } from '../services';
import { MatSidenav } from '@angular/material/sidenav';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LoaderService } from '../shared/loader.subject';
import { ActivatedRoute,Router} from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as FusionCharts from 'fusioncharts';


export interface DialogData {
  value: string;
  status: string;
  employee_detail: string;
}

export interface EditDialogData {
  data: string
}

export interface ViewDialogData {
  data: string
}


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
  employee_detail: any;
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
  dataSource: Object;



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



  constructor(private loader_subject: LoaderService,private ticket_service: TicketService,private router: Router, public dialog: MatDialog)
             { this.viewList = false; }



  ngOnInit() {
    this.user_object = JSON.parse(localStorage.currentUser);
    this.loader_subject.setLoader(true);

    this.ticket_service.employeeDashboard(this.user_object.data.employee_number)
      .subscribe(
        response => {
         
          this.ticket_status_data = response["data"]["ticket_data"]["status"];
          this.employee_detail = response["data"]['employee_detail'];
        console.log(this.ticket_status_data, response['data']["ticket_data"]['department_graph'])
        
          // if(this.ticket_status_data.Assigned!=0)
          // {
          //   if(this.ticket_status_data.Open==undefined)
          //   {
          //     this.ticket_status_data.Open=0
          //     this.ticket_status_data.Open=  this.ticket_status_data.Assigned+this.ticket_status_data.Open
          //   console.log(this.ticket_status_data.Open)
          //   }
          //   else if(this.ticket_status_data.Open!=undefined){
          //     if(this.ticket_status_data.Assigned==undefined)
          //     {
          //       this.ticket_status_data.Assigned=0
          //     }
          //     this.ticket_status_data.Open=  this.ticket_status_data.Assigned+this.ticket_status_data.Open
          //     console.log(this.ticket_status_data.Open)
          //   }
            
          // }
          // if(this.ticket_status_data.Waiting_For_Approval)
          // {
          //   if(this.ticket_status_data.Processing==undefined)
          //   {
          //     this.ticket_status_data.Processing=0
          //     this.ticket_status_data.Processing=  this.ticket_status_data.Waiting_For_Approval+this.ticket_status_data.Processing
          //   //console.log(this.ticket_status_data.Processing)
          //   }
          //   else if(this.ticket_status_data.Processing!=undefined){
          //     if(this.ticket_status_data.Waiting_For_Approval==undefined)
          //     {
          //       this.ticket_status_data.Waiting_For_Approval=0
          //     }
          //     this.ticket_status_data.Processing=  this.ticket_status_data.Waiting_For_Approval+this.ticket_status_data.Processing
          //     //console.log(this.ticket_status_data.Processing)
          //   }
            
           
          // }
          // if(this.ticket_status_data.Work_Around)
          // {
          //   if(this.ticket_status_data.Processing==undefined)
          //   {
          //     this.ticket_status_data.Processing=0
          //     this.ticket_status_data.Processing=  this.ticket_status_data.Work_Around+this.ticket_status_data.Processing
          //     //console.log(this.ticket_status_data.Work_Around)
          //   }
          //   else if(this.ticket_status_data.Processing!=undefined){
          //     if(this.ticket_status_data.Work_Around==undefined)
          //     {
          //       this.ticket_status_data.Work_Around=0
                
          //     this.ticket_status_data.Processing=  this.ticket_status_data.Work_Around+this.ticket_status_data.Processing
          //     }
          //     //console.log(this.ticket_status_data.Work_Around)         
            
          //   }
            
          // }
          // if(this.ticket_status_data.Reopened)
          // {
          //   this.ticket_status_data.Open=  this.ticket_status_data.Reopened+this.ticket_status_data.Open
          //   //console.log(this.ticket_status_data.Work_Around)
          // }


          // this.overall_ticket = Number(this.ticket_status_data.Open) + Number(this.ticket_status_data.Processing) + Number(this.ticket_status_data.Closed);
          this.ticket_depatment_data = response["data"]["ticket_data"]["department_table"];
          this.over_all_department_data = response["data"]["ticket_data"]["over_all"];
          this.ticket_graph = response["data"]["ticket_data"]["department_graph"];
          this.ticket_bar = response["data"]["ticket_data"]["department_bar"];
          this.departments = response["data"]["ticket_data"]["departments"];
          this.status_mapping = response["data"]["ticket_data"]["status_configuration"];
          // this.gauge_max = parseInt(this.over_all_department_data.length);
          this.load_dashboard_table = true;
          this.doughnutChartFun();
       // this.yScaleMax=this.gauge_max;
         // console.log(this.yScaleMax)
         
        }
      );
      console.log(this.ticket_graph)

      // this.doughnutChartFun();
  }

  doughnutChartFun() {
  
    // STEP 3 - Chart Configuration
    const dataSou = {
      chart: {
        "pieRadius": "90",
        theme: "fusion",
        "showLegend": "0",
        "showpercentvalues": "0",
        // "defaultcenterlabel": "Total Tickets",
      },
      // Chart Data - from step 2
      data: this.ticket_graph
    };
    this.dataSource = dataSou;
    this.loader_subject.setLoader(false)

  }

  pieChartLabel(ticket_graph: any[], name: string): string {
    const item = ticket_graph.filter(data => data.name === name);
    if (item.length > 0) {
        return item[0].label;
    }
    return name;
}
  onChange(data) {
    alert(data.type);

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

  openDialog(item: any): void {
    const dialogRef = this.dialog.open(TicketDialog, {
      data: {
        value:this.over_all_department_data,
        status: item ,
        employee_detail: this.employee_detail
      }, 
      maxHeight: '600px',
      width: '1250px',
      disableClose: true
    })
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
  view = 'view';
  @Input() table_data: any[];
  @Input() status_mapping: any;
  @Input() employee_detail: any[];
  @Input() type: String;
  @Input() disable_edit: Boolean;
  @Input() viewList: Boolean;
  @Input() admin_dashboard: Boolean = true;
  @Input() disable_department: Boolean;
  @Input() created_by: string;
  @Input() selected_department: any;
  @Output() ticket_detail = new EventEmitter<any>();
  @Output() closePopUp = new EventEmitter<any>();
  displayedColumns: string[]
  constructor(private loader_subject: LoaderService,private ticket_service: TicketService,private router: Router) { this.viewList = false; }
 
  ngOnInit() {
    console.log(this.employee_detail,this.selected_department,'emp')
    this.ticket_data.filterPredicate =
     (data: Element, filter: string) => data['created_by'].employee_name.indexOf(filter) != -1;
    console.log(this.ticket_data.filterPredicate )
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
      if(confirm("Are you sure to delete the ticket?")) {
        this.closePopUp.emit('true');
        this.ticket_service.delteobjectid(ticket_id)
        .subscribe(
          response => {
            this.router.navigateByUrl('/add_ticket', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/employee_dashboard'], { queryParams: { department: this.selected_department } });
            });
            this.loader_subject.setLoader(false)
          });
      } else {
        console.log('cancel')
      }

    }
    
  }
  show_icon(edit){
    

  }
}

@Component({
  selector: 'ticket-dialog',
  templateUrl: 'ticket-dialog.html',
})
export class TicketDialog implements OnInit {
 
  public all_department_data : any;
  temp : any; 
  employee_detail: any; 
  // view: any = '';
  @Output() selected_ticket_id: any;
  selected_department: any;
  superAdminUrl: any = '';
 
  constructor(public dialogRef: MatDialogRef<TicketDialog> , @Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog, private route: ActivatedRoute) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  getNotification(event) {
    alert('ji')
    this. onNoClick();
  }
  ngOnInit(){
    this.selected_department = this.route.snapshot.queryParams['department'];
    this.superAdminUrl = this.route.snapshot['_routerState']['url'];
    console.log(this.selected_department,this.superAdminUrl);


    // this.selected_ticket_id = this.data['data']['ticket_id']

    this.temp = this.data.value;
    this.employee_detail = this.data.employee_detail
    this.all_department_data = this.temp.filter(element => {
      return element.status == this.data.status
    });
    console.log(this.all_department_data,'return_Data')
    console.log(this.data,'sent value',this.data.employee_detail,this.temp )


  }

  onChange(item) {
    // this.view = item.type;
    // this.selected_ticket_id = item.ticket_id
    // console.log(item);
    
    if(this.selected_department == undefined) {
      const dialogRef = this.dialog.open(EditTicketDialog, {
        data: {
          data: item
        }, 
        maxHeight: '600px',
        width: '1250px',
        disableClose: true
      })
    } else {
      const dialogRef = this.dialog.open(ViewTicketDialog, {
        data: {
          data: item
        }, 
        maxHeight: '600px',
        width: '1250px',
        disableClose: true
      })
    }
    
  } 
    
}

@Component({
  selector: 'edit-ticket-dialog',
  templateUrl: 'edit-ticket-dialog.html',
})
export class EditTicketDialog implements OnInit {
 
  public all_department_data : any;
  temp : any;  
  view: any = '';
  @Output() selected_ticket_id: any;
 
  constructor(
    public dialogRef: MatDialogRef<EditTicketDialog> , @Inject(MAT_DIALOG_DATA) public editData: EditDialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(){
    console.log(this.editData,'sent value')
    this.view = this.editData.data['type'];
    this.selected_ticket_id = this.editData.data['ticket_id']
    // this.temp = this.data.value;
    // this.all_department_data = this.temp.filter(element => {
    //   return element.status == this.data.status
    // });
    console.log(this.selected_ticket_id,'selected_ticket_id')

  }
    
}

@Component({
  selector: 'view-ticket-dialog',
  templateUrl: 'view-ticket-dialog.html',
})
export class ViewTicketDialog implements OnInit {
 
  public all_department_data : any;
  temp : any;  
  view: any = '';
  @Output() selected_ticket_id: any;
  @Output() selected_department: any;
 
  constructor(
    public dialogRef: MatDialogRef<ViewTicketDialog> , @Inject(MAT_DIALOG_DATA) public viewData: ViewTicketDialog, private route: ActivatedRoute) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(){
    this.selected_department = this.route.snapshot.queryParams['department'];

    console.log(this.viewData,'sent value')
    this.view = this.viewData['data']['type'];
    this.selected_ticket_id = this.viewData['data']['ticket_id']
    // this.temp = this.data.value;
    // this.all_department_data = this.temp.filter(element => {
    //   return element.status == this.data.status
    // });
    console.log(this.selected_ticket_id,this.selected_department,'selected_ticket_id')

  }
    
}