import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})

export class RegistrationComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router, private http: HttpClient) {} 

  onSubmit() {
    if (this.password === this.confirmPassword) {
      this.http.post('http://localhost:3000/api/userregistration', {
        username: this.username, 
        password: this.password, 
        email: this.email
      }).subscribe(
        success => {
          alert('Regisztráció sikeres!');
          this.router.navigate(['/login']);
        },
        error => {
          const errorMessage = error.error ? error.error.message : 'Ismeretlen hiba történt.';
          alert("Regisztráció sikertelen: " + errorMessage);
        }
      );
    } else {
      alert('A jelszavak nem egyeznek!');
    }
  }
  
  back() {
    this.router.navigate(['/login']);
  }
}
