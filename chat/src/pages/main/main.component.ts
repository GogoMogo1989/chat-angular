import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user.model';
import { AuthService } from '../../authguard/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {
  users: User[] = []; 
  messages: { user: string, text: string }[] = []; 
  currentMessage: string = '';  
  selectedUser: string | null = null;
  currentUser: any

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.getUserData(userId);
    }
    this.getUsers(); 
  }

  getUserData(userId: string) {
    this.http.get(`http://localhost:3000/api/getuser/${userId}`).subscribe(
      (data) => {
        this.currentUser = data;
      },
      (error) => {
        console.error('Hiba a felhasználói adatok lekérdezésekor:', error);
      }
    );
  }

  getUsers() {
    this.http.get<User[]>('http://localhost:3000/api/getuser').subscribe(
      (data) => {
        this.users = data;  
      },
      (error) => {
        console.error('Hiba a felhasználók lekérdezésekor:', error);
      }
    );
  }

  sendMessage() {
      this.messages.push({ user: 'You', text: this.currentMessage });
      this.currentMessage = ''; 
  }

  selectUser(user: User) {
    this.selectedUser = user.username; 
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login']);
  }
}
