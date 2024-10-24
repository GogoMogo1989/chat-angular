import { Component,OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {

  isModalOpen = false;
  selectedFile!: File;
  currentUser: any = { username: '', email: '' };
  password: string = ''; 
  confirmPassword: string = '';  
  passwordMismatch: boolean = false;

  constructor(private http: HttpClient){}

  ngOnInit(): void {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.getUserData(userId);
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    
     if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true; 
      return;
    }

    if (this.currentUser.username && this.currentUser.email) {
      console.log('Form submitted!', this.currentUser);
      this.closeModal();
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
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

  updateUserData() {
    const userId = sessionStorage.getItem('userId');

    if (userId) {
      this.http.put(`http://localhost:3000/api/updateuser/${userId}`, {
        username: this.currentUser.username,
        email: this.currentUser.email,
        password: this.password, 
        profileImage: this.selectedFile 
      }).subscribe(
        (data) => {
          this.currentUser = data; 
          console.log('Felhasználó sikeresen frissítve!', data);
          this.closeModal();
        },
        (error) => {
          console.error('Hiba a felhasználó frissítésekor:', error);
        }
      );
    }
  }

}
