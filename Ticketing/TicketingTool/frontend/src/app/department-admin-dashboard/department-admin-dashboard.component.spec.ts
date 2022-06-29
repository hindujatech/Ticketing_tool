import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentAdminDashboardComponent } from './department-admin-dashboard.component';

describe('DepartmentAdminDashboardComponent', () => {
  let component: DepartmentAdminDashboardComponent;
  let fixture: ComponentFixture<DepartmentAdminDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentAdminDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentAdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
