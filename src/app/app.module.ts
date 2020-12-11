import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {MenuComponent} from './menu/menu.component';
import {LogComponent} from './log/log.component';

import { AppRoutingModule } from './app-routing.module';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { fr_FR } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import {NzSliderModule} from 'ng-zorro-antd/slider';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDropDownModule} from 'ng-zorro-antd/dropdown/';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';


import { CookieModule } from 'ngx-cookie';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import {MessageComponent} from './message/message.component';
import {SettingComponent} from './setting/setting.component';
import {UsersComponent} from './users/users.component';
import {UserComponent} from './user/user.component';
import {PostsComponent} from './posts/posts.component';
import {NewComponent} from './new/new.component';

registerLocaleData(fr);

@NgModule({
  declarations: [
    AppComponent,
    NewComponent,
    LogComponent,
    UserComponent,
    MenuComponent,
    MessageComponent,
    SettingComponent,
    UsersComponent,
    PostsComponent
  ],
  imports: [
    NgxQRCodeModule,
    CookieModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    ReactiveFormsModule,
    NzSliderModule,
    NzBreadCrumbModule,
    NzCardModule,
    NzDropDownModule,
    NzAutocompleteModule,
    NzPopconfirmModule,
    NzAvatarModule,
    NzTagModule,
    NzTableModule
  ],
  providers: [{ provide: NZ_I18N, useValue: fr_FR }],
  bootstrap: [AppComponent]
})
export class AppModule { }
