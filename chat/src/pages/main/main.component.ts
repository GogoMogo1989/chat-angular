import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface User {
  _id: string;  
  username: string;
}

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

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.getUsers(); 
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
    if (this.currentMessage.trim()) {
      this.messages.push({ user: 'You', text: this.currentMessage });
      this.currentMessage = ''; 
    }
  }

  selectUser(user: User) {
    this.selectedUser = user.username; 
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
