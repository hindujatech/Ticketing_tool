import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, AuthenticationService } from '../services';


@Component({
  selector: 'app-userlogin',
  templateUrl: './userlogin.component.html',
  styleUrls: ['./userlogin.component.css'],
})
export class UserloginComponent implements OnInit {
  formdata;
  loginForm: FormGroup;
  returnUrl: string;
  disable: Boolean = false;
  hide: Boolean = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService) { }
  ngOnInit() {
    this.formdata = new FormGroup({
      user_name: new FormControl("", Validators.compose([
        Validators.required,
        Validators.maxLength(10),
        Validators.minLength(5)
      ])),
      password: new FormControl("", this.passwordvalidation)
    });
    
    if (localStorage.currentUser) {
      this.router.navigate(['/employee_dashboard']);
    } else {
      this.authenticationService.logout();
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/employee_dashboard';
  }
  passwordvalidation(formcontrol) {
    if (formcontrol.value.length < 5 || formcontrol.value.length > 20) {
      return { "password": true };
    }
  }
  onClickSubmit() {
    if (this.formdata.valid) {
      this.disable = true;
      this.authenticationService.login(this.formdata.value.user_name, this.formdata.value.password)
        .subscribe(
          data => {
            this.router.navigate([this.returnUrl]);
          },
          error => {
            this.disable = false;
            this.alertService.error(error);
          });
    }

  }

}
