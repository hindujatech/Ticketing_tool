import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule, MatSidenavModule, MatIconModule, MatProgressSpinnerModule, MatSortModule, MatBadgeModule, MatTooltipModule, MatBottomSheetModule, MatDialogModule, MatTabsModule, MatAutocompleteModule, MatGridListModule, MatTableModule, MatButtonModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatCardModule, MatExpansionModule, MatProgressBarModule, MatCheckboxModule } from '@angular/material';
// import { NbChatModule, NbThemeModule, NbLayoutModule } from '@nebular/theme';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { HttpModule } from "@angular/http";
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { CommonheaderComponent } from './layout/commonheader/commonheader.component';
import { FooterComponent } from './layout/footer/footer.component';
import { UserloginComponent } from './userlogin/userlogin.component';

import { AuthGuard } from './guards';
import { AlertService, AuthenticationService, RedirectService } from './services';
import { JwtInterceptor, ErrorInterceptor } from './helpers';
import { AlertComponent } from './directives';
import { ErrorPageComponent } from './directives';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TopMenuComponent } from './layout/top-menu/top-menu.component';
import { UserIdleModule } from 'angular-user-idle';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { LoaderService } from "./shared/loader.subject";
import { ProfilePicService } from "./shared/profile_pic.subject";
import { TopmenuService } from "./shared/top-menu.subject";
import { TicketService } from './services/ticket.service';
import { PushNotificationService } from "./services/push_notification.service"
import { ServerErrorService } from "./services/server_error.service"

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Ng2OdometerModule } from 'ng2-odometer';
import { customFilter } from './pipe/custom_pipe';



//for push notification
import { ToasterModule } from 'angular5-toaster';
import { AddTicketComponent } from './add-ticket/add-ticket.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { DashBoardTable } from './employee-dashboard/employee-dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DepartmentAdminDashboardComponent } from './department-admin-dashboard/department-admin-dashboard.component';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { TicketEditComponent } from './ticket-edit/ticket-edit.component';
import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { FlatpickrModule } from 'angularx-flatpickr';
import { EmployeeTicketViewComponent } from './employee-ticket-view/employee-ticket-view.component';
import { ApproveRequestComponent } from './approve-request/approve-request.component';
import { EmployeeTicketEditComponent } from './employee-ticket-edit/employee-ticket-edit.component';
const appRoutes: Routes = [
  {
    path: 'login',
    component: UserloginComponent
  },
  {
    path: 'add_ticket',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'employee_dashboard',
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'super_admin_dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'department_admin_dashboard',
    component: DepartmentAdminDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'approve_request',
    component: ApproveRequestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ticket_edit',
    component:TicketEditComponent ,
    canActivate: [AuthGuard]
  },
  {
    path: 'error_page',
    component: ErrorPageComponent,
  },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    UserloginComponent,
    AlertComponent,
    CommonheaderComponent,
    TopMenuComponent,
    HomeComponent,
    AddTicketComponent,
    EmployeeDashboardComponent,
    DashBoardTable,
    ErrorPageComponent,
    MyProfileComponent,
    customFilter,
    AdminDashboardComponent,
    DepartmentAdminDashboardComponent,
    TicketEditComponent,
    TicketViewComponent,
    EmployeeTicketViewComponent,
    ApproveRequestComponent,
    EmployeeTicketEditComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    HttpModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatGridListModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    HttpClientModule,
    NgbModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatTabsModule,
    MatTooltipModule,
    MatCardModule,
    MatBadgeModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatSortModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule,
    ToasterModule,
    NgxChartsModule,
    MaterialFileInputModule,
    FlatpickrModule.forRoot(),
    Ng2OdometerModule.forRoot(),
    UserIdleModule.forRoot({ idle: 900, timeout: 1, ping: 1 })
  ],
  entryComponents: [],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    RedirectService,
    LoaderService,
    TopmenuService,
    TicketService,
    PushNotificationService,
    ProfilePicService,
    ServerErrorService,
    // {provide: 'rootVar', useValue: 'hello'},
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // provider used to create fake backend
    //fakeBackendProvider
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
  constructor(private push_notification_service: PushNotificationService) {
    // Consume events: Change
    this.push_notification_service.consumeEvenOnEmployeeCreateTicket();
    // this.push_notification_service.consumeEvenOnAdminReplied();
  }

}
