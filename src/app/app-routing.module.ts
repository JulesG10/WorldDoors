import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { LogComponent } from './log/log.component';
import { NewComponent } from './new/new.component';
import {UserComponent} from './user/user.component';

const routes: Routes = [
  { path: 'new', component: NewComponent },
  { path: '', component: LogComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'user', component: UserComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
