import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from 'src/app/models/User';
import { UsersService } from 'src/app/services/UsersService';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    form: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: '',
            password: '',
            rememberMe: false
        });
    }

    onSubmit(): void {
        if (this.form.valid) {
            const user: User = {
                username: this.form.value.username,
                password: this.form.value.password,
                messages: [],
                topics: []
            }

            this.usersService.login(user).subscribe((user: User) => {
                if (this.form.value.rememberMe) {
                    this.usersService.saveConnectedUserToLocalStorage(user);
                } else {
                    this.usersService.connectedUser = user;
                    this.usersService.emitConnectedUser();
                }

                this.router.navigate(['/']);
            }, error => {
                this.snackBar.open('Aucun utilisateur n\'a été trouvé. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
            });
        }
    }

    getErrorMessage(formControlName: string): string | void {
        if (this.form.controls[formControlName].hasError('required')) {
            return 'Ce champ est obligatoire';
        }
    }
}
