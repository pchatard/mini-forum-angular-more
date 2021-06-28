import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/User';

@Injectable()
export class UsersService {
    apiUrl = 'http://localhost:8080/';

    users: User[] = [];
    usersSubject = new Subject<User[]>();

    connectedUser?: User;
    connectedUserSubject = new Subject<User>();

    constructor(private httpClient: HttpClient) {
        this.setConnectedUserFromLocalStorage();
    }

    emitUsers(): void {
        this.usersSubject.next(this.users);
    }

    emitConnectedUser(): void {
        this.connectedUserSubject.next(this.connectedUser);
    }

    setConnectedUserFromLocalStorage(): void {
        if (localStorage.getItem('connectedUser')) {
            this.connectedUser = JSON.parse(localStorage.getItem('connectedUser')!);
            this.emitConnectedUser();
        }
    }

    saveConnectedUserToLocalStorage(user: User): void {
        localStorage.setItem('connectedUser', JSON.stringify(user));
        this.setConnectedUserFromLocalStorage();
    }

    removeConnectedUserFromLocalStorage(): void {
        localStorage.removeItem('connectedUser');

        this.connectedUser = undefined;
        this.emitConnectedUser();
    }

    getUsers(): Observable<User[]> {
        return this.httpClient.get<User[]>(this.apiUrl + 'api/user', { observe: 'body' });
    }

    createNewUser(user: User): Observable<User> {
        return this.httpClient.post<User>(this.apiUrl + 'api/user', user);
    }

    login(user: User): Observable<User> {
        return this.httpClient.post<User>(this.apiUrl + 'login', user);
    }

    updateUser(user: User, updatedUser: any): Observable<User> {
        let updatedUserData = updatedUser;
        if (updatedUser.isAdmin === undefined) {
            updatedUserData.isAdmin = updatedUser.admin;
        }
        return this.httpClient.patch<User>(this.apiUrl + 'api/user/' + user.id, updatedUserData);
    }

    deleteUser(user: User): Observable<any> {
        return this.httpClient.delete(this.apiUrl + 'api/user/' + user.id);
    }
}
