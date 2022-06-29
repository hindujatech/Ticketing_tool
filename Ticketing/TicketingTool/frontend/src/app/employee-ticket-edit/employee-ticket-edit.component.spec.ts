import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTicketEditComponent } from './employee-ticket-edit.component';

describe('EmployeeTicketEditComponent', () => {
  let component: EmployeeTicketEditComponent;
  let fixture: ComponentFixture<EmployeeTicketEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeTicketEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTicketEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
