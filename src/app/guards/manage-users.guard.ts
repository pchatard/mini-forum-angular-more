import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { UsersService } from '../services/UsersService';

@Injectable({
    providedIn: 'root'
})
export class ManageUsersGuard implements CanActivate {
    constructor(
        private usersService: UsersService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return new Observable(observer => {
            this.usersService.connectedUserSubject.subscribe((user: User) => {
                if (user) {
                    if (user.admin) {
                        observer.next(true);
                    } else {
                        observer.next(this.router.parseUrl('/'));
                    }
                } else {
                    observer.next(this.router.parseUrl('/login'));
                }

                observer.complete();
            });

            this.usersService.emitConnectedUser();
        });
    }

}
