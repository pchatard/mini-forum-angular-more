import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Message } from 'src/app/models/Message';
import { Topic } from 'src/app/models/Topic';
import { User } from 'src/app/models/User';
import { MessagesService } from 'src/app/services/MessagesService';
import { TopicsService } from 'src/app/services/TopicsService';
import { UsersService } from 'src/app/services/UsersService';

@Component({
    selector: 'topic',
    templateUrl: './topic.component.html',
    styleUrls: ['./topic.component.css']
})
export class TopicComponent implements OnInit, OnDestroy {
    form: FormGroup;

    topic: Topic;
    topicSubscription: Subscription;

    editedMessage?: Message;

    connectedUser: User;
    connectedUserSubscription: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private usersService: UsersService,
        private topicsService: TopicsService,
        private messagesService: MessagesService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.topicSubscription = this.topicsService.getTopic(this.route.snapshot.params['id']).subscribe((topic: Topic) => {
            topic.date = new Date(topic.date);

            topic.messages = topic.messages.map((message: Message) => {
                message.date = new Date(message.date);
                return message;
            });

            this.topic = topic;
        });

        this.form = this.formBuilder.group({
            content: ['', [Validators.minLength(5), Validators.maxLength(3000)]],
        });

        this.usersService.connectedUserSubject.subscribe((user: User) => {
            this.connectedUser = user;
        });

        this.usersService.emitConnectedUser();
    }

    onRefreshMessages(): void {
        this.topicsService.getTopic(this.topic.id!).subscribe((topic: Topic) => {
            topic.date = new Date(topic.date);

            topic.messages = topic.messages.map((message: Message) => {
                message.date = new Date(message.date);
                return message;
            });

            this.topic = topic;
            this.snackBar.open('Messages actualisés', 'Fermer', { duration: 3000 });
        }, error => {
            this.snackBar.open('Une erreur est survenue lors de l\'actualisation des messages', 'Fermer', { duration: 3000 });
        });
    }

    selectMessage(message: Message) {
        if (this.editedMessage === message) {
            this.editedMessage = undefined;
            this.form.reset();
        } else {
            this.editedMessage = message;
            this.form.controls.content.setValue(this.editedMessage.content);
        }
    }

    onDeleteMessage(message: Message) {
        this.messagesService.deleteMessage(message).subscribe(() => {
            const msgIndex = this.topic.messages.findIndex(msg => msg.id === message.id);
            if (msgIndex >= 0) {
                this.topic.messages.splice(msgIndex, 1);
                this.snackBar.open('Ce message a bien été supprimé', 'Fermer', { duration: 3000 });
            }
        }, error => {
            this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
        });
    }

    onSubmit(): void {
        if (this.form.valid && !this.editedMessage) {
            const message: Message = {
                content: this.form.value.content,
                date: new Date().getTime(),
                author: this.connectedUser,
                topic: this.topic
            }

            this.messagesService.postNewMessage(message).subscribe((message: Message) => {
                this.topicsService.getTopic(this.topic.id!).subscribe((topic: Topic) => {
                    topic.date = new Date(topic.date);

                    topic.messages = topic.messages.map((message: Message) => {
                        message.date = new Date(message.date);
                        return message;
                    });

                    this.topic = topic;
                    this.topicsService.emitTopics();

                    this.snackBar.open('Votre message a bien été envoyé', 'Fermer', { duration: 3000 });

                    this.form.reset();

                    Object.keys(this.form.controls).forEach(formControlName => {
                        this.form.controls[formControlName].setErrors(null);
                    });
                });
            }, error => {
                this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
            });
        } else if (this.form.valid && this.editedMessage) {
            this.messagesService.updateMessage({ ...this.editedMessage, ...this.form.value }).subscribe((message: Message) => {
                const messageIndex = this.topic.messages.findIndex(msg => msg.id === message.id);
                if (messageIndex >= 0) {
                    this.topic.messages.splice(messageIndex, 1, message);
                    this.snackBar.open('Votre message a bien été modifié', 'Fermer', { duration: 3000 });
                    this.form.reset();
                    this.editedMessage = undefined;
                    Object.keys(this.form.controls).forEach(formControlName => {
                        this.form.controls[formControlName].setErrors(null);
                    });
                } else {
                    this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
                }
            }, error => {
                this.snackBar.open('Une erreur est survenue. Veuillez vérifier votre saisie', 'Fermer', { duration: 3000 });
            });
        }
    }

    ngOnDestroy(): void {
        if (this.connectedUserSubscription) {
            this.connectedUserSubscription.unsubscribe();
        }

        if (this.topicSubscription) {
            this.topicSubscription.unsubscribe();
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
    }
}
