import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './../shared/guard/auth.guard';
import { SecureInnerPagesGuard } from './../shared/guard/secure-inner-pages.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingComponent } from './landing/landing.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
// import { ForgotPasswordComponent } from  './forgot-password/forgot-password.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: LandingComponent },
      { path: 'home', component: HomeComponent,  canActivate: [AuthGuard] },
      { path: 'admin', component: AdminComponent,  canActivate: [AuthGuard] },
      { path: 'login', component: LoginComponent, canActivate: [SecureInnerPagesGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [SecureInnerPagesGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
