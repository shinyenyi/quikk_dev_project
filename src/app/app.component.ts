import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginAndRegistrationService } from './login-and-registration/login-and-registration.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'quikk-dev-project';

  constructor(public loginAndRegistrationService: LoginAndRegistrationService,
    private router: Router
    ) { }

  logout() {
    this.loginAndRegistrationService.logout().subscribe(() => {
      this.router.navigate(['/loginAndRegistration']);
    });
  }
}
