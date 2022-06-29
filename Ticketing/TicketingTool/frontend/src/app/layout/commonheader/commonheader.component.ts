import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services';
import { Router } from '@angular/router';
import { ProfilePicService } from '../../shared/profile_pic.subject'
import { BACK_END_URL } from '../../shared/app.globals';
import { TicketService } from '../../services';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-commonheader',
  templateUrl: './commonheader.component.html',
  styleUrls: ['./commonheader.component.css']
})
export class CommonheaderComponent implements OnInit {
  user_name: string = '';
  profile_pic: String = '';
  profile_pic_valid: Boolean = false;
  admin_flag_list: any;
  approve_request_flag: Boolean;
  constructor(private profile_pic_service: ProfilePicService, private authenticationService: AuthenticationService, private router: Router,private ticket_service: TicketService) { }

  ngOnInit() {

    var jsonObj = JSON.parse(localStorage.currentUser);
    console.log("jsonObj: ", jsonObj);
    this.admin_flag_list = jsonObj.data.admin_flags;
    this.approve_request_flag=jsonObj.data.approve_flag;
    this.user_name = jsonObj.data.first_name;
    this.profile_pic_service.setProfilePic(jsonObj.data.profile_pic_url)
    setTimeout(() => {
      this.profile_pic_service.getProfilePic().subscribe(url => {
        this.profile_pic = BACK_END_URL + url;
        url.length > 0 ? this.profile_pic_valid = true : this.profile_pic_valid = false
      });
    });

  }
  redirect(type,department){
    localStorage.setItem('department', department);
    if(type=="employee"){
      this.router.navigate(['/employee_dashboard']);
    }
    else if(type=="approve_request"){
      this.router.navigate(['/approve_request']);
    }
    else if(department=="Super Admin"){
      this.router.navigate(['/super_admin_dashboard']);
    }
    else{
      this.router.navigate(['/department_admin_dashboard'],{ queryParams: { department: department } });
    }
  }

  Onlogout() {
    this.authenticationService.logout();
    this.router.navigate(['/']);
  }
  export_change(department)
  {
   // var str = department;
  //  var res = department  //split by space
   // res.pop();  //remove last element
     //join back together
    
   var department_details  = department;
 

    this.ticket_service.ticket_export(department_details)
        .subscribe(
          (response:any) => {
            console.log(response)
            // var blob = new Blob([response], {type: 'text/csv' })
            // saveAs(blob, "myFile.csv");
            if(department_details!="Super Admin")
            {
              saveAs(response,department_details+".csv");
            }
            else{
              saveAs(response,"Common.csv");
            }
            
    
        
          })
     
  }

}
