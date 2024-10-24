import { Component,OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {

  isModalOpen = false;
  currentUser: any = { username: '', email: '' };
  password: string = ''; 
  confirmPassword: string = '';  
  passwordMismatch: boolean = false;
  base64Image: string = ''; 
  imageError: string = '';

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

    this.updateUserData();
  }

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
        profileImage: this.base64Image
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