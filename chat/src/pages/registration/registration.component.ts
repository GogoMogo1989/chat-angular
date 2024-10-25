import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';

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

  constructor(
    private router: Router, 
    private userService: UserService
  ) {} 

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
      reader.readAsDataURL(file);
    } else {
      this.imageError = 'Kérjük, válasszon ki egy képet!';
    }
  }

  onSubmit() {
    if (this.password === this.confirmPassword) {
      this.userService.userRegistration({
        username: this.username, 
        password: this.password, 
        email: this.email,
        profileImage: this.base64Image
      }).subscribe({  
          next: () => {
            alert('Regisztráció sikeres!');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            alert("Regisztráció sikertelen: " + error);
          }
        },
      );
    } else {
      alert('A jelszavak nem egyeznek!');
    }
  }
  
  back() {
    this.router.navigate(['/login']);
  }
}
