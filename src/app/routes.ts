import { Routes } from '@angular/router';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { TopicComponent } from './components/topic/topic.component';
import { EditUserGuard } from './guards/edit-user.guard';
import { ManageUsersGuard } from './guards/manage-users.guard';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'sign-in', component: SignInComponent },
    { path: 'login', component: LoginComponent },
    { path: 'edit-user', canActivate: [EditUserGuard], component: EditUserComponent },
    { path: 'manage-users', canActivate: [ManageUsersGuard], component: ManageUsersComponent },
    { path: 'topic/:id', component: TopicComponent },
    { path: 'logout', component: LogoutComponent }
];
