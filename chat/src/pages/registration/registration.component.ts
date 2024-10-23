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
  base64Image: string = ''; 
  imageError: string = '';

  constructor(private router: Router, private http: HttpClient) {} 

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.base64Image = reader.result as string; 
        this.imageError = '';
      };
      reader.onerror = () => {
        this.imageError = 'Hiba történt a kép feltöltése során.';
      };
      reader.readAsDataURL(file); // Base64 átalakítás
    } else {
      this.imageError = 'Kérjük, válasszon ki egy képet!';
    }
  }

  onSubmit() {
    if (this.password === this.confirmPassword) {
      this.http.post('http://localhost:3000/api/userregistration', {
        username: this.username, 
        password: this.password, 
        email: this.email,
        profileImage: this.base64Image
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
