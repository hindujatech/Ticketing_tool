import { Component, EventEmitter, Output, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { TicketService } from '../services';
import { BACK_END_URL } from '../shared/app.globals';
import { LoaderService } from '../shared/loader.subject'
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// type AOA = any[];


@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styleUrls: ['./ticket-edit.component.css']

})
export class TicketEditComponent implements OnInit, OnChanges {
  // data: AOA;
  // wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  // fileName: string = 'SheetJS.xlsx';
  arrayBuffer:any;
  file:File;
  
  departments: any = [];
  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;

  admins: any = [];
  Object = Object;
  priority: any = [];
  sub_functions: any = [];
  ticket_category: any = [];
  ticket_detail: any = [];
  employee_detail: any = [];
  ticket_status: any = [];
  ticket_details: any = [];

  filtered_employee_list: any = [];
  attachment: string = '';
  raised_by: string;
  sub_unit: string;
  mobile_no:string;
  minDate: any;//= new Date();
  tentative_minDate: any;// = new Date();
  form_data: any;
  given_status:string;
  prevVal: string;
  dept_change_flag: Boolean = false;

  currentUser: any;
  employee_num: any;
  assign_flag: Boolean = false;
  depname: any;

  @Input() ticket_id: any;
  @Output() edit_submit = new EventEmitter<any>();
  @Input() selected_department: any;
  constructor(private router: Router, private loader_subject: LoaderService, private ticket_service: TicketService) { }

  ngOnChanges() {
    console.log("ticket_edit")
    this.update_table_detail();
    setTimeout(() => {
      //this.formDirective.resetForm();
      this.form_data.controls.department.setValue(this.selected_department);
    })
    this.form_data.updateValueAndValidity();

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // console.log("CurrentUser: ",this.currentUser);
    this.employee_num = this.currentUser["data"]["employee_number"]
    this.depname=localStorage.getItem('department');
    console.log("this.depname", this.depname);
    if (this.depname == "IT-Infrastructure")
    {
      if(this.employee_num == "18100" || this.employee_num == "8000687" || this.employee_num == "15585" || this.employee_num == "17515")
      {
        this.assign_flag = false;
      }
      else
      {
        this.assign_flag = true;
      }
    }
  }
  ngOnInit() {
    // this.update_table_detail();
    // setTimeout(() => {
    //   this.formDirective.resetForm();
    //   this.form_data.controls.department.setValue(this.selected_department);
    // })
    // this.form_data.updateValueAndValidity();

    // var jsonObj = JSON.parse(localStorage.currentUser);
    // var emp_name = jsonObj.first_name+" "+jsonObj.last_name;
    // var employee_id=jsonObj.employee_number;
    // console.log(emp_name, employee_id);
    
    
  }

  update_table_detail() {

    this.form_data = new FormGroup({
      department: new FormControl("", [Validators.required]),
      sub_function: new FormControl("", [Validators.required]),
      ticket_category: new FormControl("", [Validators.required]),
      priority: new FormControl("", [Validators.required]),
      assigned_to: new FormControl("", [Validators.required]),
      status: new FormControl("", [Validators.required]),
      addressed_on: new FormControl("",[Validators.required]),
      tentative_closed_on: new FormControl("", [Validators.required])
    });

    this.ticket_service.getTicketDetail(this.ticket_id)
      .subscribe(
        response => {
          this.ticket_detail = response["data"]["ticket_detail"]["ticket_detail"];
          console.log(response)
          this.given_status =this.form_data.get('status').value;
   
          this.ticket_details=response["data"]["ticket_details"];
                 
 
          this.admins = response["data"]["ticket_detail"]["admins"];
          this.priority = response["data"]["ticket_detail"]["priority"];
          this.sub_functions = response["data"]["ticket_detail"]["sub_functions"];
          this.ticket_category = response["data"]["ticket_detail"]["ticket_category"];
          this.employee_detail = response["data"]["employee_detail"];
         this.raised_by= this.employee_detail[this.ticket_detail.created_by].employee_name;
         this.sub_unit=this.employee_detail[this.ticket_detail.created_by].sub_unit;
         console.log(this.employee_detail[this.ticket_detail.created_by].mobile_number)
         this.mobile_no=this.employee_detail[this.ticket_detail.created_by].mobile_number
          this.departments = response["data"]["ticket_detail"]["departments"];
          var not_in_array = ['Open', 'Reopened']
          this.ticket_status = response["data"]["ticket_detail"]["ticket_admin_status"].filter(item =>
            !not_in_array.includes(item)
          );
            console.log(this.ticket_detail )
          if(this.ticket_detail["addressed_on"]){
            this.tentative_minDate = this.ticket_detail["addressed_on"];
            this.form_data.controls['addressed_on'].patchValue(this.tentative_minDate);

            this.minDate = this.ticket_detail["addressed_on"];
          }else{
            this.tentative_minDate = new Date();
            this.form_data.controls['addressed_on'].patchValue(this.tentative_minDate);
            this.minDate = new Date();
          }
          
         //console.log(this.ticket_detail["status"]);
          for (let key of Object.keys(this.ticket_detail)) {
            let mealName = this.ticket_detail[key];

            if (this.form_data.controls[key])
              this.form_data.controls[key].setValue(this.ticket_detail[key]);
          }
          if (this.ticket_detail["attachment"])
            this.attachment = BACK_END_URL + "attachments/" + this.ticket_detail["attachment"];
          //console.log(this.form_data);
        }
      );

      this.form_data.controls.sub_function.valueChanges.subscribe(value => {
        this.form_data.controls['priority'].setValue('P1');
      });
      

    this.form_data.controls.department.valueChanges.subscribe(value => {
      let validators = null;
      if (value == this.selected_department) {
        validators = [Validators.required];
      }
      Object.keys(this.form_data.controls).forEach(control_name => {
        if (control_name != "department") {
          this.form_data.controls[control_name].setValidators(validators);
          
          if (validators){
            this.form_data.controls[control_name].enable();
          }         
          else{
            this.form_data.controls[control_name].enable();
          }
        }
      });
      this.form_data.updateValueAndValidity();
    });
    this.form_data.controls.status.valueChanges.subscribe(value => {
      if (value === "Closed" || value === "Confirm") {
         this.form_data.addControl('closed_reason', new FormControl("", [Validators.required]));
         this.form_data.removeControl('admin_description');
         this.form_data.removeControl('approved_by');
         this.form_data.controls["closed_reason"].enable();
         
         this.form_data.controls["addressed_on"].clearValidators();
          this.form_data.controls["addressed_on"].updateValueAndValidity();
           this.form_data.controls["tentative_closed_on"].clearValidators();
           this.form_data.controls["tentative_closed_on"].updateValueAndValidity();
         
        // this.form_data.controls['closed_reason'].setValidators([Validators.required]);
        // this.form_data.controls['admin_description'].setValidators(null);
        // this.form_data.controls['approved_by'].setValidators(null);
      }
      else if (value === "Processing") {
        this.form_data.addControl('admin_description', new FormControl("", [Validators.required]));
       this.form_data.addControl('tentative_closed_on', new FormControl("", [Validators.required]));
       this.form_data.addControl('addressed_on', new FormControl("", [Validators.required]));
      
        this.form_data.removeControl('closed_reason');
        this.form_data.removeControl('approved_by');
        this.form_data.controls["admin_description"].enable();
        // this.form_data.controls["addressed_on"].enable();
        // this.form_data.controls["tentative_closed_on"].enable();
       
      }
      else if (value === "Waiting For Approval") {
        this.form_data.addControl('approved_by', new FormControl("", [Validators.required]));
        this.form_data.removeControl('closed_reason');
        this.form_data.removeControl('admin_description');
        this.form_data.controls["addressed_on"].clearValidators();
        this.form_data.controls["addressed_on"].updateValueAndValidity();
         this.form_data.controls["tentative_closed_on"].clearValidators();
         this.form_data.controls["tentative_closed_on"].updateValueAndValidity();
       // this.form_data.controls["approved_by"].enable();
        
       // this.form_data.controls['approved_by'].setValidators([Validators.required]);
      }
      else {
         this.form_data.removeControl('closed_reason');
         this.form_data.removeControl('admin_description');
         this.form_data.removeControl('approved_by');
        //  
        //this.form_data.removeControl('addressed_on');
        if (value!="Work Around")
        {
          this.form_data.controls["addressed_on"].clearValidators();
          this.form_data.controls["addressed_on"].updateValueAndValidity();
        
        }
         if (value === "Assigned") {
          this.form_data.controls["addressed_on"].clearValidators();
          this.form_data.controls["addressed_on"].updateValueAndValidity();
           this.form_data.controls["tentative_closed_on"].clearValidators();
           this.form_data.controls["tentative_closed_on"].updateValueAndValidity();
         

         // this.form_data.controls["tentative_closed_on"].disable();
         // this.form_data.controls['tentative_closed_on'].setValidators(null);
         //this.form_data.get('tentative_closed_on').clearValidators();


          
          
         //this.form_data.controls['tentative_closed_on'].setValidators(null);
         }
        // this.form_data.controls['approved_by'].setValidators(null);
        // this.form_data.controls['closed_reason'].setValidators(null);    
        // this.form_data.controls['admin_description'].setValidators(null);
      }
      this.form_data.updateValueAndValidity();
    });
    this.loader_subject.setLoader(false)
  }
  update_employee_list(event) {
    var value = event.target.value;

    const filterValue = value.toLowerCase();
   
    if (filterValue) {
      console.log(filterValue)
      this.ticket_service.getFilteredEmployeeList(filterValue)
        .subscribe(
          response => {
            this.filtered_employee_list = response["data"];
          }
        );
    } else {
      this.filtered_employee_list = {};
    }
    this.ticket_service.getrmdetails(this.ticket_id)
      .subscribe(
        response => {
          console.log(response)
          //this.ticket_detail = response["data"]["ticket_detail"]["ticket_detail"];
        })
    
  }
  displayFn(employee): string | undefined {
    return employee ? employee.employee_name : undefined;
  }
  OnDestroy() {
    this.loader_subject.setLoader(false)
  }
  onSubmit() {
    
    let validators = null;
  
      validators = [Validators.required];
    
    Object.keys(this.form_data.controls).forEach(control_name => {
      if (control_name != "department") {
        this.form_data.controls[control_name].setValidators(validators);
        if (validators){
         // this.form_data.controls[control_name].enable();
        }         
        else{
         // this.form_data.controls[control_name].enable();
        }
      }
    })
   // this.form_data.controls['assigned_to'].enable();
   console.log(this.form_data.valid)
   if(this.form_data.get('status').value=='Open')
   {
    this.form_data.get('status').value='';
    console.log(this.form_data.get('status').valid);
   
    this.form_data.controls['status'].enable();

   }



    if (this.form_data.valid) {
      this.loader_subject.setLoader(true);
      //console.log(this.form_data.value)
      var form_ticket_detail = this.form_data.value;
      form_ticket_detail.ticket_id = this.ticket_id;
      var jsonObj = JSON.parse(localStorage.currentUser);
      form_ticket_detail.modified_by = jsonObj.data.sAMAccountName;
      if (form_ticket_detail.department != this.selected_department)
        form_ticket_detail.department_change = true;
      else
        form_ticket_detail.department_change = false;
        

      this.ticket_service.saveAdminTicketEdit(form_ticket_detail)
        .subscribe(
          response => {
            this.edit_submit.emit(true);
            //console.log(this.router.url);
            this.router.navigateByUrl('/add_ticket', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/department_admin_dashboard'], { queryParams: { department: this.selected_department } });
            });
            this.loader_subject.setLoader(false);
          });
    }
  }
  assigned_changed(assigned,employee_name,ticket_code)
  {
   // alert(assigned);

    
    let assigned_to=this.form_data.get('assigned_to').value;
    this.ticket_service.sendAssignedmail(assigned_to,employee_name,ticket_code)
      .subscribe(
        response => {
          console.log(response)
        })
        

  }
  department_changed(target,newvalue)
  {
   //alert(this.selected_department)
   
  
    this.ticket_service.target_subdepartments(this.form_data.get('department').value)
      .subscribe(
        response => {
          console.log(response)
         // this.sub_functions = response["data"]["ticket_data"];
          this.admins = response["data"]["adminsdata"];
          this.employee_detail = response["data"]["employee_detail"];
         if(this.selected_department!=this.form_data.get('department').value)
         {
          //this.ticket_category = response["data"]["subcategory"];

          this.form_data.controls['ticket_category'].setValidators(null);
          this.form_data.controls['sub_function'].setValidators(null);
          this.form_data.controls["sub_function"].disable();
          this.form_data.controls["ticket_category"].disable();
         }
         else{
          this.ticket_category = response["data"]["subcategory"];
          this.form_data.controls["sub_function"].enable();
          this.form_data.controls["ticket_category"].enable();

         }
          
  
          //this.form_data.controls["ticket_category"].disable();
         
        })
    

  }
  // category_changed()
  // {
  //  // alert(this.form_data.get('department').value)
  
  //   this.ticket_service.target_subcategory(this.form_data.get('department').value,this.form_data.get('').value)
  //     .subscribe(
  //       response => {
  //         console.log(response)
  //         this.sub_functions = response["data"]["ticket_data"];
  //         this.admins = response["data"]["adminsdata"];
  //         this.employee_detail = response["data"]["employee_detail"];
  //         this.form_data.controls["ticket_category"].disable();
         
  //       })
    

  // }
  // export_change()
  // {
  //   this.ticket_service.ticket_export()
  //       .subscribe(
  //         (response:any) => {
  //           console.log(response)
  //           // var blob = new Blob([response], {type: 'text/csv' })
  //           // saveAs(blob, "myFile.csv");
  //           saveAs(response, "myFile.csv");
    
        
  //         })
     
  // }
  // onFileChange(evt: any) {
  //   /* wire up file reader */
  //   const target: DataTransfer = <DataTransfer>(evt.target);
  //   if (target.files.length !== 1) throw new Error('Cannot use multiple files');
  //   const reader: FileReader = new FileReader();
  //   reader.onload = (e: any) => {
  //     /* read workbook */
  //     const bstr: string = e.target.result;
  //     const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

  //     /* grab first sheet */
  //     const wsname: string = wb.SheetNames[0];
  //     const ws: XLSX.WorkSheet = wb.Sheets[wsname];

  //     /* save data */
  //     this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
  //     console.log(this.data);
  //   };
  //   reader.readAsBinaryString(target.files[0]);
  // }
  incomingfile(event) 
  {
  this.file= event.target.files[0]; 
  }

 Upload() {
      let fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.arrayBuffer = fileReader.result;
            var data = new Uint8Array(this.arrayBuffer);
            var arr = new Array();
            for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
            var workbook = XLSX.read(bstr, {type:"binary"});
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
        }
        fileReader.readAsArrayBuffer(this.file);
}

}





