import { Component, OnInit, ViewChild } from '@angular/core';
import { TicketService } from '../services';
import { LoaderService } from '../shared/loader.subject'
import { ProfilePicService } from '../shared/profile_pic.subject'
import { BACK_END_URL } from '../shared/app.globals';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  @ViewChild('file') file;
  fileUploadError: Boolean = false;
  profile_pic: String = '';
  profile_pic_valid: Boolean = false;
  edit_information: Boolean = false;
  employee_info: any = new FormGroup({});
  ErrorMessage: String = "Unable to upload image";
  user_object = JSON.parse(localStorage.currentUser);
  constructor(private ticket_service: TicketService, private loader_subject: LoaderService, private profile_pic_service: ProfilePicService) { }

  ngOnInit() {
    this.profile_pic_service.setProfilePic(this.user_object.data.profile_pic_url)
    this.profile_pic_service.getProfilePic().subscribe(url => { this.profile_pic = BACK_END_URL + url; url.length > 0 ? this.profile_pic_valid = true : this.profile_pic_valid = false });

  }

  onFilesAdded() {

    var allowedExtensions =
      ["jpg", "jpeg", "png", "JPG", "JPEG", "JFIF", "BMP", "SVG"];
    var file = this.file.nativeElement.files.item(0);
    var fileExtension = file.name.split('.').pop();
    if (allowedExtensions.includes(fileExtension) && file.size < 2000000) {
      this.loader_subject.setLoader(true)
      const formData = new FormData();
      formData.append("file", file);
      this.ticket_service.profilePicUpload(formData, this.user_object.data.employee_number)
        .subscribe(
          response => {
            this.profile_pic_service.setProfilePic(response["data"])
            this.user_object.data.profile_pic_url = response["data"];
            localStorage.setItem('currentUser', JSON.stringify(this.user_object));
            this.loader_subject.setLoader(false)
          },
          error => {
            console.log(error);
            this.fileUploadError = true;
            this.ErrorMessage = "Profile Pic Not Uploaded"
            this.loader_subject.setLoader(false)
          }
        );
    } else {
      this.fileUploadError = true;
      this.ErrorMessage = "Only Image Allowed With Less than 2MB"
    }

  }
  edit_info() {
    this.edit_information = true;
    this.employee_info = new FormGroup({
      location: new FormControl("", Validators.compose([
        Validators.required,
      ])),
      mobile_number: new FormControl("", Validators.compose([
        Validators.required,
        Validators.maxLength(10),
        Validators.minLength(10)
      ])),
    });
    this.employee_info.controls['mobile_number'].setValue(this.user_object.data.mobile_number);
    this.employee_info.controls['location'].setValue(this.user_object.data.location);

  }
  keyPress(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  cancel_edit_info() {
    this.edit_information = false;
  }
  submit_edit_info() {
    if (this.employee_info.valid) {
      this.ticket_service.editInformation(this.employee_info.value, this.user_object.data.employee_number)
        .subscribe(
          response => {
            this.user_object.data.location = response["data"]["location"];
            this.user_object.data.mobile_number = response["data"]["mobile_number"];
            localStorage.setItem('currentUser', JSON.stringify(this.user_object));
            this.loader_subject.setLoader(false);
            this.edit_information = false;
          },
          error => {
            this.fileUploadError = true;
            this.ErrorMessage = "Employee Info No Updated"
            this.loader_subject.setLoader(false)
          }
        );
    }
  }
  OnDestroy() {
    this.loader_subject.setLoader(false)
  }
  addFiles() {
    this.fileUploadError = false;
    this.ErrorMessage = ""
    this.file.nativeElement.click();
  }

}
