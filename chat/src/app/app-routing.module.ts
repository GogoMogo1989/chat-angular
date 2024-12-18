import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from '../pages/login/login.component';
import { RegistrationComponent } from '../pages/registration/registration.component';
import { MainComponent } from '../pages/main/main.component';
import { UserComponent } from '../pages/user/user.component';

import { AuthGuard } from '../authguard/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full' },
  {path:'login', component: LoginComponent},
  {path:'registration', component: RegistrationComponent},
  {path:'main', component: MainComponent, canActivate :[AuthGuard]},
  {path:'user', component: UserComponent, canActivate :[AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
