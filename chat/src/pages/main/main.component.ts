import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user.model';
import { AuthService } from '../../authguard/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
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

  ngOnDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }

  setupWebSocket() {
    this.ws = new WebSocket('ws://localhost:3000'); 

    this.ws.onopen = () => {

      const username = sessionStorage.getItem('username');

      if (username) {
        const usernameMessage = {
          type: 'setUsername',
          username: username 
        };
        this.ws.send(JSON.stringify(usernameMessage));
      }
    };

    // Üzenetek fogadása a szervertől
    this.ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      if (receivedData.sender && receivedData.message) {
        this.messages.push({ user: receivedData.sender, text: receivedData.message });
      }
    };

    // Hiba esetén kezelje
    this.ws.onerror = (error) => {
      console.error('WebSocket hiba:', error);
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
        if (this.users.length > 0) {
          this.selectUser(this.users[0]); 
        }
      },
      (error) => {
        console.error('Hiba a felhasználók lekérdezésekor:', error);
      }
    );
  }

  selectUser(user: User) {
    this.selectedUser = user.username; 
    this.getMessages(this.currentUser.username, this.selectedUser);
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

     if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageData));
    }

    this.currentMessage = ''; 

  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
