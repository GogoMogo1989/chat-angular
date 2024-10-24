import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { LoginResponse } from '../interfaces/login.model';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  login() {

    this.http.post<LoginResponse>('http://localhost:3000/api/userlogin', {
      username: this.username,
      password: this.password
    }).subscribe(
      response => {
        sessionStorage.setItem('userId', response.user.id);
        sessionStorage.setItem('username', response.user.username);
        this.authService.login(response.token)
        this.router.navigate(['/main']);
      },
      error => {
        const errorMessage = error.error ? error.error.message : 'Ismeretlen hiba történt.';
        alert("Bejelentkezés sikertelen: " + errorMessage); 
      }
    );
    
  }

  register() {
    this.router.navigate(['/registration']);
  }

}
