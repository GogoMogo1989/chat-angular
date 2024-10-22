import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  login() {

    this.http.post('http://localhost:3000/api/userlogin', {
      username: this.username,
      password: this.password
    }).subscribe(
      response => {
        alert('Bejelentkezés sikeres!');
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
