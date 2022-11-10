import { Component, OnInit } from '@angular/core';
import { LoginAndRegistrationService } from '../login-and-registration/login-and-registration.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {

  user$ = this.loginAndRegistrationService.currentUser$;

  constructor(private loginAndRegistrationService: LoginAndRegistrationService) { }

  ngOnInit(): void {
  }

}
