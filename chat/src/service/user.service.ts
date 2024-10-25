import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from '../interfaces/login.model';
import { User } from '../interfaces/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getUserData(userId: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getuser/${userId}`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getuser/`);
  }

  updateUserData(userId: string, userData: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/updateuser/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}/deleteuser/${userId}`);
  }

  userRegistration(userData: any): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/userregistration`, userData);
  }

  userLogin(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/userlogin`, userData);
  }
}
