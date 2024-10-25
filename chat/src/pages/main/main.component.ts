import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user.model';
import { AuthService } from '../../service/auth.service';
import { UserComponent } from '../user/user.component';
import { UserService } from '../../service/user.service';
import { Messages } from '../../interfaces/messages.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  users: User[] = []; 
  messages: { user: string, text: string }[] = [];; 
  currentMessage: string = '';  
  selectedUser!: string
  currentUser: any;
  private ws!: WebSocket;
  hasNewMessage?: boolean;

  @ViewChild('user') user!: UserComponent;

  constructor( 
    private router: Router, 
    private authService: AuthService,
    private userService: UserService
  ) {}

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

    this.ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
    
      if (
        (receivedData.sender === this.currentUser.username && receivedData.receiver === this.selectedUser) ||
        (receivedData.sender === this.selectedUser && receivedData.receiver === this.currentUser.username)
      ) {
        this.messages.push({
          user: receivedData.sender, 
          text: receivedData.message
        });
      } else if (receivedData.receiver === this.currentUser.username && receivedData.sender !== this.selectedUser) {
        const senderUser = this.users.find(user => user.username === receivedData.sender);
        if (senderUser) {
            senderUser.hasNewMessage = true;
        }
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket hiba:', error);
    };
  }

  getUserData(userId: string) {
    this.userService.getUserData(userId).subscribe({
        next: (data: User) => {
          this.currentUser = data;
        },
        error: (error) => {
          console.error('Hiba a felhasználói adatok lekérdezésekor:', error);
        }
      } 
    );
  }

  getUsers() {
    this.userService.getUsers().subscribe({
        next: (data: User[]) => {
          this.users = data;  
          if (this.users.length > 0) {
            this.selectUser(this.users[0]); 
          }
        },
        error: (error) => {
          console.error('Hiba a felhasználók lekérdezésekor:', error);
        }
      } 
    );
  }

  selectUser(user: User) {
    this.selectedUser = user.username; 
    this.getMessages(this.currentUser.username, this.selectedUser);
    user.hasNewMessage = false
  }

  getMessages(sender: string, receiver: string) {
    this.userService.getMessages(sender, receiver).subscribe({
        next: (data: Messages[]) => {
          this.messages = data.map(message => ({ 
            user: message.sender, 
            text: message.message 
            })
          );
        },
        error: (error) => {
          console.error('Hiba az üzenetek lekérdezésekor:', error);
        }
      } 
    );
  }

  sendMessage() {
    if (!this.currentMessage || !this.selectedUser) {
      return; 
    }

    const messageData: Messages = {
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

  openUser() {
    this.user.openModal()
  }
}
