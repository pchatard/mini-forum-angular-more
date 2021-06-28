import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { DialogConfirmComponent } from 'src/app/dialogs/dialog-confirm.component';
import { User } from 'src/app/models/User';
import { UsersService } from 'src/app/services/UsersService';

@Component({
    selector: 'app-manage-users',
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit, OnDestroy {

    filterControl: FormControl;

    connectedUser: User;
    connectedUserSubscription: Subscription;

    users: User[] = [];
    filteredUsers: User[] = [];
    usersSubscription: Subscription;

    dialogRefSubscription: Subscription;

    editedUser?: User;
    editUserForm: FormGroup;

    constructor(private usersService: UsersService, private formBuilder: FormBuilder, private dialog: MatDialog, private snackbar: MatSnackBar) { }

    ngOnInit(): void {
        // Set connected user
        this.usersService.connectedUserSubject.subscribe((user: User) => {
            this.connectedUser = user;
        });

        this.usersService.emitConnectedUser();

        // Get users from API
        this.usersService.getUsers().subscribe((users: User[]) => {
            console.log(users);

            this.usersService.users = users;
            this.usersService.emitUsers();
        });

        // Subscribe to users subject
        this.usersService.usersSubject.subscribe((users: User[]) => {
            this.users = users;
            this.filteredUsers = users;
        });

        // Set up the filter
        this.filterControl = this.formBuilder.control('');
        this.filterControl.valueChanges.subscribe(filterValue => {
            if (filterValue) {
                this.filteredUsers = this.users.filter(user => user.username.includes(filterValue));
            } else {
                this.filteredUsers = this.users;
            }
        });

        this.editUserForm = this.formBuilder.group({
            username: ['', [Validators.minLength(3), Validators.maxLength(50)], this.uniqueNameValidator()],
            isAdmin: false
        });
    }

    uniqueNameValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            return new Observable<ValidationErrors | null>(observer => {

                if (this.editedUser && this.editedUser.username === control.value) {
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

    selectUser(user: User): void {
        if (this.editedUser === user) {
            this.editedUser = undefined;
        } else {
            this.editedUser = user;
            this.editUserForm.updateValueAndValidity();
            this.editUserForm.setValue({
                username: this.editedUser.username,
                isAdmin: this.editedUser.admin
            });
        }
    }

    onEditUser(user: User) {
        if (this.editUserForm.valid && this.connectedUser.admin) {
            console.log(this.editUserForm.value.isAdmin);

            this.usersService.updateUser(user, { ...this.editUserForm.value, connectedUser: this.connectedUser }).subscribe(response => {
                const index = this.usersService.users.findIndex(userElt => userElt.id === user.id);
                this.usersService.users[index] = { ...user, username: this.editUserForm.value.username, admin: this.editUserForm.value.isAdmin };
                this.usersService.emitUsers();
                this.snackbar.open('Cet utilisateur a bien été modifié', 'Fermer', { duration: 3000 });

                this.editUserForm.reset();
                this.editedUser = undefined;
            }, error => {
                this.snackbar.open('Une erreur est survenue', 'Fermer', { duration: 3000 });
            });
        }
    }

    onDeleteUser(user: User): void {
        // Open dialog
        const dialogRef = this.dialog.open(DialogConfirmComponent, {
            data: {
                title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
                content: 'Cette action est irréversible.',
                action: 'Supprimer'
            },
            autoFocus: false
        });

        // Get dialog result
        this.dialogRefSubscription = dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.usersService.deleteUser(user).subscribe(() => {
                    this.usersService.users = this.users.filter(userElt => userElt.id !== user.id);
                    this.usersService.emitUsers();
                    this.snackbar.open('Cet utilisateur a bien été supprimé', 'Fermer', { duration: 3000 });
                }, error => {
                    this.snackbar.open('Une erreur est survenue', 'Fermer', { duration: 3000 });
                })
            }
        }, error => {
            this.snackbar.open('Une erreur est survenue', 'Fermer', { duration: 3000 });
        });

    }

    getErrorMessage(formControlName: string): string | void {
        if (this.editUserForm.controls[formControlName].hasError('required')) {
            return 'Ce champ est obligatoire';
        }

        if (this.editUserForm.controls[formControlName].hasError('minlength')) {
            return 'Vous devez entrer au moins ' + this.editUserForm.controls[formControlName].getError('minlength').requiredLength + ' caractères';
        }

        if (this.editUserForm.controls[formControlName].hasError('maxlength')) {
            return 'Vous ne pouvez pas entrer plus de ' + this.editUserForm.controls[formControlName].getError('maxlength').requiredLength + ' caractères';
        }

        if (this.editUserForm.controls[formControlName].hasError('uniqueName')) {
            return 'Ce nom d\'utilisateur est déjà utilisé';
        }
    }

    ngOnDestroy(): void {
        if (this.dialogRefSubscription) {
            this.dialogRefSubscription.unsubscribe();
        }

        if (this.connectedUserSubscription) {
            this.connectedUserSubscription.unsubscribe();
        }

        if (this.usersSubscription) {
            this.usersSubscription.unsubscribe();
        }
    }

}
