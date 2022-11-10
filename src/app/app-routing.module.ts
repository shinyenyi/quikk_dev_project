import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginAndRegistrationComponent } from './login-and-registration/login-and-registration.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

const redirectToLogin = () => redirectUnauthorizedTo(['/loginAndRegistration']);
const redirectToMyAccount = () => redirectLoggedInTo(['/loginAndRegistration/myAccount']);

const routes: Routes = [
  {
    path: '', redirectTo: 'loginAndRegistration', pathMatch: 'full'
  },
  {
    path: 'loginAndRegistration',
    children: [
      {
        path: '',
        component: LoginAndRegistrationComponent,
        ...canActivate(redirectToMyAccount)
      },
      {
        path: 'myAccount',
        component: MyAccountComponent,
        ...canActivate(redirectToLogin)
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
