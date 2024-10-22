import { Component } from '@angular/core';
import { Router} from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit() {
    if (this.password === this.confirmPassword) {
      console.log('Regisztráció sikeres:', {
        username: this.username,
        email: this.email,
        password: this.password
      });
    } else {
      console.log('A jelszavak nem egyeznek!');
    }
  }

  back() {
    this.router.navigate(['/login']);
  }

}
