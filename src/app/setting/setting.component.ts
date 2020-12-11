import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  NgxQrcodeElementTypes,
  NgxQrcodeErrorCorrectionLevels,
} from '@techiediaries/ngx-qrcode';
import { URL } from '../app.component';
import { CookieService } from 'ngx-cookie';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {
  passwordChange!: FormGroup;
  descChange!: FormGroup;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  value = document.location.origin + '?user=';
  description: string | undefined;
  oldDesc = '';
  Id: number | undefined;
  Username: string | undefined;
  private URL = URL;
  Error = 'Entrer un mot de passe !';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) { }

  public confirmDesc(): void {
    this.SubmitChangeDesc();
  }
  public confirmPass(): void {
    this.SubmitChangePassword();
  }
  public confirmDel(): void {
    this.http.post(this.URL, { id: this.Id, remove: true }).subscribe((data) => {
      this.router.navigate(['/']);
    }, (err) => {
      this.router.navigate(['/']);
    });
  }

  public cancel(): void { }

  private SubmitChangeDesc(): void {
    // tslint:disable-next-line: forin
    for (const i in this.descChange.controls) {
      this.descChange.controls[i].markAsDirty();
      this.descChange.controls[i].updateValueAndValidity();
    }
    if (this.descChange.status === 'VALID') {
      this.http.post(this.URL, {
        description: this.descChange.value.desc,
        image: '', id: this.Id
      }).subscribe((data: any) => {
        this.descChange.reset();
        this.getDescription();
      }, (err: any) => {
        this.descChange.reset();
        this.getDescription();
      });
    }
  }

  public SubmitChangePassword(): void {
    // tslint:disable-next-line: forin
    for (const i in this.passwordChange.controls) {
      this.passwordChange.controls[i].markAsDirty();
      this.passwordChange.controls[i].updateValueAndValidity();
    }
    if (this.passwordChange.status === 'VALID') {
      if (this.passwordChange.value.password !== this.passwordChange.value.oldpassword) {
        this.Error = 'Mot de passe non identique !';
        this.passwordChange.reset();
        this.SubmitChangePassword();
      }else{
        this.Error = 'Entrer un mot de passe !';
        this.http.post(this.URL, { id: this.Id, newpassword: this.passwordChange.value.password })
        .subscribe((data: any) => { }, (err: any) => { });
        this.passwordChange.reset();
      }
    }
  }

  public getDescription(): void {
    this.http.get(this.URL + '?desc=' + this.Username).subscribe(
      (data: any) => {
        if (!data.error) {
          this.oldDesc = data.message.description;
        }
      },
      (err: any) => { }
    );
  }

  ngOnInit(): void {
    try {
      const keep = JSON.parse(this.cookieService.get('Saved'));
      const name = keep.name;
      // tslint:disable-next-line: radix
      this.Id = parseInt(keep.id);
      this.Username = name;
      this.value += name;
      this.getDescription();
    } catch { }
    this.passwordChange = this.fb.group({
      oldpassword: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
    this.descChange = this.fb.group({
      desc: [null, []],
    });
  }
}
