import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/models/User';
import { TopicsService } from 'src/app/services/TopicsService';
import { UsersService } from 'src/app/services/UsersService';

@Component({
    selector: 'edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit, OnDestroy {
    form: FormGroup;
    connectedUser: User;
    connectedUserSubscription: Subscription;
    regexPasswordPattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{5,50}';

    constructor(
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private topicsService: TopicsService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.connectedUserSubscription = this.usersService.connectedUserSubject.subscribe((user: User) => {
            this.connectedUser = user;

            this.form = this.formBuilder.group({
                username: [user.username, [Validators.minLength(3), Validators.maxLength(50)], this.uniqueNameValidator()],
                password: ['', [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.regexPasswordPattern), this.samePasswordValidator()]],
                passwordConfirm: ['', [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.regexPasswordPattern), this.samePasswordConfirmValidator()]],
                oldPassword: ''
            });
        });

        this.usersService.emitConnectedUser();
    }

    onSubmit(): void {
        if (this.form.valid) {
            const user: User = {
                id: this.connectedUser?.id,
                username: this.form.value.username,
                password: this.form.value.password,
                passwordConfirm: this.form.value.passwordConfirm,
                oldPassword: this.form.value.oldPassword,
                messages: [],
                topics: []
            }

            this.usersService.updateUser(this.connectedUser, user).subscribe((user: User) => {
                if (localStorage.getItem('connectedUser')) {
                    this.usersService.saveConnectedUserToLocalStorage(user);
                } else {
                    this.usersService.connectedUser = user;
                    this.usersService.emitConnectedUser();
                }

                this.topicsService.refreshTopics();

                this.snackBar.open('Votre compte a bien été modifié', 'Fermer', { duration: 3000 });

                this.router.navigate(['/']);
            }, error => {
                this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
            });
        }
    }

    ngOnDestroy(): void {
        if (this.connectedUserSubscription) {
            this.connectedUserSubscription.unsubscribe();
        }
    }

    uniqueNameValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            return new Observable<ValidationErrors | null>(observer => {
                if (control.value === this.connectedUser.username) {
                    observer.next(null);
                    observer.complete();
                }

                this.usersService.getUsers().subscribe((users: User[]) => {
                    if (users.find(user => user.username === control.value)) {
                        observer.next({ uniqueName: { value: control.value } });
                    } else {
                        observer.next(null);
                    }

                    observer.complete();
                });
            });
        };
    }

    samePasswordValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.form) {
                if (this.form.value.passwordConfirm && control.value !== this.form.controls.passwordConfirm.value) {
                    return { samePassword: { value: control.value } };
                }

                if (this.form.controls.passwordConfirm.hasError('samePasswordConfirm')) {
                    try {
                        this.form.controls.passwordConfirm.updateValueAndValidity();
                    } catch (error) { }
                }
            }

            return null;
        }
    }

    samePasswordConfirmValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (this.form) {
                if (control.value !== this.form.controls.password.value) {
                    return { samePasswordConfirm: { value: control.value } };
                }

                if (this.form.controls.password.hasError('samePassword')) {
                    this.form.controls.password.updateValueAndValidity();
                }
            }

            return null;
        }
    }

    getErrorMessage(formControlName: string): string | void {
        if (this.form.controls[formControlName].hasError('required')) {
            return 'Ce champ est obligatoire';
        }

        if (this.form.controls[formControlName].hasError('minlength')) {
            return 'Vous devez entrer au moins ' + this.form.controls[formControlName].getError('minlength').requiredLength + ' caractères';
        }

        if (this.form.controls[formControlName].hasError('maxlength')) {
            return 'Vous ne pouvez pas entrer plus de ' + this.form.controls[formControlName].getError('maxlength').requiredLength + ' caractères';
        }

        if (this.form.controls[formControlName].hasError('uniqueName')) {
            return 'Ce nom d\'utilisateur est déjà utilisé';
        }

        if (this.form.controls[formControlName].hasError('samePassword')) {
            return 'Vous devez entrer le même mot de passe que celui entré dans la confirmation';
        }

        if (this.form.controls[formControlName].hasError('samePasswordConfirm')) {
            return 'Vous devez entrer le même mot de passe que précédemment';
        }

        if (this.form.controls[formControlName].hasError('pattern')) {
            return 'Vous devez entrer au moins une majuscule, un chiffre et un caractère spécial';
        }
    }
}
