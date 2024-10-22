import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  users: string[] = ['User1', 'User2', 'User3']; 
  messages: { user: string, text: string }[] = []; 
  currentMessage: string = '';  

  sendMessage() {
    if (this.currentMessage.trim()) {
      this.messages.push({ user: 'You', text: this.currentMessage });
      this.currentMessage = ''; 
    }
  }
}
