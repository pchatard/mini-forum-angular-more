import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/User';
import { UsersService } from 'src/app/services/UsersService';

@Component({
    selector: 'sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
    form: FormGroup;
    regexPasswordPattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{5,50}';

    constructor(
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            username: ['', [Validators.minLength(3), Validators.maxLength(50)], this.uniqueNameValidator()],
            password: ['', [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.regexPasswordPattern), this.samePasswordValidator()]],
            passwordConfirm: ['', [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(this.regexPasswordPattern), this.samePasswordConfirmValidator()]],
            rememberMe: false
        });
    }

    onSubmit(): void {
        if (this.form.valid) {
            const user: User = {
                username: this.form.value.username,
                password: this.form.value.password,
                passwordConfirm: this.form.value.passwordConfirm,
                messages: [],
                topics: []
            }

            this.usersService.createNewUser(user).subscribe((user: User) => {
                if (this.form.value.rememberMe) {
                    this.usersService.saveConnectedUserToLocalStorage(user);
                } else {
                    this.usersService.connectedUser = user;
                    this.usersService.emitConnectedUser();
                }

                this.snackBar.open('Votre compte a bien été créé', 'Fermer', { duration: 3000 });

                this.router.navigate(['/']);
            }, error => {
                this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
            });
        }
    }

    uniqueNameValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            return new Observable<ValidationErrors | null>(observer => {
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
