import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { DialogConfirmComponent } from 'src/app/dialogs/dialog-confirm.component';
import { Topic } from 'src/app/models/Topic';
import { User } from 'src/app/models/User';
import { TopicsService } from 'src/app/services/TopicsService';
import { UsersService } from 'src/app/services/UsersService';

@Component({
    selector: 'homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
    form: FormGroup;
    filterControl: FormControl;

    connectedUser: User;
    connectedUserSubscription: Subscription;

    topics: Topic[] = [];
    filteredTopics: Topic[] = [];
    topicsSubscription: Subscription;

    editedTopic?: Topic;
    editTopicControl: FormControl;

    dialogRefSubscription: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private topicsService: TopicsService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.usersService.connectedUserSubject.subscribe((user: User) => {
            this.connectedUser = user;

            this.form = this.formBuilder.group({
                title: ['', [Validators.minLength(5), Validators.maxLength(100)]],
                content: ['', [Validators.minLength(5), Validators.maxLength(3000)]],
            });
        });

        this.usersService.emitConnectedUser();

        this.topicsService.topicsSubject.subscribe((topics: Topic[]) => {
            this.topics = topics;
            this.filteredTopics = topics;

            this.filterControl = this.formBuilder.control('');

            this.filterControl.valueChanges.subscribe(filterValue => {
                if (filterValue) {
                    this.filteredTopics = this.topics.filter(topic => topic.title.includes(filterValue) || topic.author.username.includes(filterValue));
                } else {
                    this.filteredTopics = this.topics;
                }
            });
        });

        this.topicsService.emitTopics();

        this.editTopicControl = this.formBuilder.control(['', [Validators.minLength(5), Validators.maxLength(100)]]);
    }

    onChangeEditedTopic(topic: Topic): void {
        this.editedTopic = (this.editedTopic === topic) ? undefined : topic;
        this.editTopicControl.setValue(topic.title);
    }

    onEditTopic(topic: Topic): void {
        if (this.editTopicControl.valid && (topic.author.username === this.connectedUser.username || this.connectedUser.admin)) {
            this.topicsService.updateTopic(topic, this.editTopicControl.value).subscribe((topic: Topic) => {
                this.topicsService.topics = this.topicsService.topics.map((topicElt: Topic) => {
                    if (topicElt.id === topic.id) {
                        topicElt.title = topic.title;
                    }

                    return topicElt;
                });

                this.topicsService.emitTopics();

                this.snackBar.open('Le titre du sujet a bien été modifié', 'Fermer', { duration: 3000 });

                this.editedTopic = undefined;
            }, error => {
                this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
            });
        }
    }

    onDeleteTopic(topic: Topic): void {
        const dialogRef = this.dialog.open(DialogConfirmComponent, {
            data: {
                title: 'Êtes-vous sûr de vouloir supprimer ce sujet ?',
                content: 'Cette action est irréversible.',
                action: 'Supprimer'
            },
            autoFocus: false
        });

        this.dialogRefSubscription = dialogRef.afterClosed().subscribe(confirm => {
            if (confirm && (topic.author.username === this.connectedUser.username || this.connectedUser.admin)) {
                this.topicsService.deleteTopic(topic).subscribe(response => {
                    this.topicsService.topics = this.topicsService.topics.filter(topicElt => topicElt.id !== topic.id);
                    this.topicsService.emitTopics();

                    this.editedTopic = undefined;

                    this.snackBar.open('Le sujet a bien été supprimé', 'Fermer', { duration: 3000 });
                }, error => {
                    this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
                });
            }
        });
    }

    onSubmit(): void {
        if (this.form.valid) {
            const topic: Topic = {
                title: this.form.value.title,
                date: new Date().getTime(),
                author: this.connectedUser,
                content: this.form.value.content,
                messages: []
            };

            this.topicsService.createNewTopic(topic).subscribe((topic: Topic) => {
                this.topicsService.topics.push(topic);
                this.topicsService.emitTopics();

                this.snackBar.open('Votre sujet a bien été posté', 'Fermer', { duration: 3000 });

                this.form.reset();

                Object.keys(this.form.controls).forEach(formControlName => {
                    this.form.controls[formControlName].setErrors(null);
                });
            }, error => {
                this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
            });
        }
    }

    ngOnDestroy(): void {
        if (this.dialogRefSubscription) {
            this.dialogRefSubscription.unsubscribe();
        }

        if (this.topicsSubscription) {
            this.topicsSubscription.unsubscribe();
        }
    }

    getErrorMessage(formControlName: string | null, formControlParam?: FormControl): string | void {
        const formControl = (formControlName !== null) ? this.form.controls[formControlName] : formControlParam;

        if (formControl!.hasError('required')) {
            return 'Ce champ est obligatoire';
        }

        if (formControl!.hasError('minlength')) {
            return 'Vous devez entrer au moins ' + formControl!.getError('minlength').requiredLength + ' caractères';
        }

        if (formControl!.hasError('maxlength')) {
            return 'Vous ne pouvez pas entrer plus de ' + formControl!.getError('maxlength').requiredLength + ' caractères';
        }
    }
}
