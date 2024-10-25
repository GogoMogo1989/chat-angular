import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoginResponse } from '../../interfaces/login.model';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private userService: UserService
  ) {}

  login() {
    this.userService.userLogin({
      username: this.username,
      password: this.password
    }).subscribe({
        next: (response: LoginResponse) => { 
          sessionStorage.setItem('userId', response.user.id);
          sessionStorage.setItem('username', response.user.username);
          this.authService.login(response.token);
          this.router.navigate(['/main']);
        },
        error: (error) => {
          alert("Bejelentkezés sikertelen: " + error); 
        }
      } 
    );
  }

  register() {
    this.router.navigate(['/registration']);
  }

}
