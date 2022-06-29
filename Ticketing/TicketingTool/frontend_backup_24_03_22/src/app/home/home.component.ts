import { Component, OnInit } from '@angular/core';
import { TopmenuService } from "../shared/top-menu.subject";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],

})
export class HomeComponent implements OnInit {
  constructor(private topmenu_service: TopmenuService) { }

  ngOnInit() {
    // this.topmenu_service.setActiveTab("home");
  }
  
}
