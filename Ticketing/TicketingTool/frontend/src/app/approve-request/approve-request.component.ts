import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TicketService } from '../services';

@Component({
  selector: 'app-approve-request',
  templateUrl: './approve-request.component.html',
  styleUrls: ['./approve-request.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('200ms cubic-bezier(0.1, 0.1, 0.1, 0.1)')),
    ]),
  ]
})
export class ApproveRequestComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ticket_data: any = [];
  user_object: any;
  table_data: any[];
  @Input() employee_detail: any[];
  displayedColumns: string[]
  constructor(private ticket_service: TicketService) { }

  ngOnInit() {
    this.displayedColumns = ['ticket_code', 'status', 'action'];

    this.user_object = JSON.parse(localStorage.currentUser);
    this.ticket_service.getRequestList(this.user_object.data.employee_number)
      .subscribe(
        response => {
          console.log(response);
          this.table_data=response["data"];
          this.ticket_data = new MatTableDataSource<any>(this.table_data);
          this.ticket_data.paginator = this.paginator;
          this.ticket_data.sort = this.sort;
        }
      );


  }
  applyFilter(filterValue: string) {
    const tableFilters = [];
    tableFilters.push({
      id: 'ticket_code',
      value: filterValue.trim().toLowerCase()
    }, {
        id: 'department',
        value: filterValue.trim().toLowerCase()
      }, {
        id: 'status',
        value: filterValue.trim().toLowerCase()
      });
    this.ticket_data.filter = JSON.stringify(tableFilters);
    this.ticket_data.filter = filterValue.trim().toLowerCase();
  }
  // onClick(ticket_id, type): void {
  //   this.ticket_detail.emit({ ticket_id, type });
  // }


}
