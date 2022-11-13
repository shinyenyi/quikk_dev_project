import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { LoginAndRegistrationService } from './login-and-registration.service';

export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('signupPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordsDontMatch: true
      }
    }
    return null;
  };
}

@Component({
  selector: 'app-login-and-registration',
  templateUrl: './login-and-registration.component.html',
  styleUrls: ['./login-and-registration.component.css']
})
export class LoginAndRegistrationComponent implements OnInit {

  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  signupForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    signupEmail: new FormControl('', [Validators.required, Validators.email]),
    signupPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  },
    { validators: passwordsMatchValidator() }
  );

  constructor(private loginAndRegistrationService: LoginAndRegistrationService,
    private router: Router,
    private toast: HotToastService  ) { }

  ngOnInit(): void {
  }

  get username() {
    return this.signupForm.get('username');
  }

  get signupEmail() {
    return this.signupForm.get('signupEmail');
  }

  get signupPassword() {
    return this.signupForm.get('signupPassword');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submitSignupForm() {
    const { username, signupEmail, signupPassword } = this.signupForm.value;

    if (!this.signupForm.valid || !username || !signupEmail || !signupPassword) {
      return;
    }

    this.loginAndRegistrationService.signup(username, signupEmail, signupPassword).pipe(
      this.toast.observe({
        success: 'Registered Successfully',
        loading: 'Signing in...',
        error: ({ message }) => `${message}`
      })
    ).subscribe(() => {
      this.loginAndRegistrationService.createUserAccount(username, signupEmail);
      this.router.navigate(['/loginAndRegistration/myAccount']);
    });

    this.resetForm(this.signupForm);
  }

  submitLoginForm() {
    const { email, password } = this.loginForm.value;

    if (!this.loginForm.valid || !email || !password) {
      return;
    }

    this.loginAndRegistrationService.login(email, password).pipe(
      this.toast.observe({
        success: 'Logged in successfully',
        loading: 'Logging in...',
        error: ({ message }) => `There was an error: ${message} `,
      })
    ).subscribe(() => {
      this.router.navigate(['/loginAndRegistration/myAccount']);

    });
    this.resetForm(this.loginForm);
  }

  resetForm(form: FormGroup) {
    form.reset();
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.setErrors(null)
    });
  }

}
