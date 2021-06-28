/* General modules */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* Router */
import { RouterModule } from '@angular/router';
import { routes } from './routes';

/* Components */
import { AppComponent } from './app.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { LoginComponent } from './components/login/login.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { LogoutComponent } from './components/logout/logout.component';
import { TopicComponent } from './components/topic/topic.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';

/* Dialogs */
import { DialogConfirmComponent } from './dialogs/dialog-confirm.component';

/* Pipes */
import { TopicInfosPipe } from './pipes/TopicInfos.pipe';
import { MessageInfosPipe } from './pipes/MessageInfos.pipe';
import { MessageContentPipe } from './pipes/MessageContent.pipe';

/* Services */
import { UsersService } from './services/UsersService';
import { TopicsService } from './services/TopicsService';
import { MessagesService } from './services/MessagesService';

/* Angular Material */
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [
        AppComponent,
        HomepageComponent,
        EditUserComponent,
        LoginComponent,
        SignInComponent,
        LogoutComponent,
        TopicComponent,
        TopicInfosPipe,
        MessageInfosPipe,
        DialogConfirmComponent,
        ManageUsersComponent,
        MessageContentPipe
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        HttpClientModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatSnackBarModule,
        MatDialogModule,
        MatExpansionModule,
        MatIconModule
    ],
    providers: [
        UsersService,
        TopicsService,
        MessagesService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
