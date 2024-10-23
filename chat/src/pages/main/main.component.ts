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
  selectedUser!: string
  currentUser: any;
  private ws!: WebSocket;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.getUserData(userId);
    }
    this.getUsers();
    this.setupWebSocket();
  }

  setupWebSocket() {
   
    this.ws = new WebSocket('ws://localhost:8080'); 

    this.ws.onopen = () => {
      console.log('WebSocket kapcsolat létrejött.');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.sender !== this.currentUser.username) {
        this.messages.push({ user: message.sender, text: message.message });
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket kapcsolat lezárult.');
    };
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

  selectUser(user: User) {
    this.selectedUser = user.username; 
    this.getMessages(this.currentUser.username, this.selectedUser); // Üzenetek lekérdezése
  }

  getMessages(sender: string, receiver: string) {
    this.http.get<{ sender: string, receiver: string, message: string }[]>(`http://localhost:3000/api/messages/${sender}/${receiver}`).subscribe(
      (data) => {
        this.messages = data.map(msg => ({ user: msg.sender, text: msg.message }));
      },
      (error) => {
        console.error('Hiba az üzenetek lekérdezésekor:', error);
      }
    );
  }

  sendMessage() {
    if (!this.currentMessage || !this.selectedUser) {
      return; 
    }

    const messageData = {
      sender: this.currentUser.username,
      receiver: this.selectedUser,
      message: this.currentMessage
    };

    this.http.post('http://localhost:3000/api/messages', messageData).subscribe(
      (response: any) => {
        this.messages.push({ user: 'You', text: this.currentMessage });
        this.currentMessage = ''; 
      },
      (error) => {
        console.error('Hiba az üzenet küldésekor:', error);
      }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
