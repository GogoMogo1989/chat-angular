import { Component } from '@angular/core';
import { Router} from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
   
    console.log('Felhasználónév:', this.username);
    console.log('Jelszó:', this.password);

  }

  register() {
    this.router.navigate(['/registration']);
  }

}
