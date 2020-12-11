import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie';
import { URL } from '../app.component';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
})
export class LogComponent implements OnInit {
  private URL = URL;
  validateForm!: FormGroup;
  checked = true;
  TipUser = 'Please input your username!';
  TipPass = 'Please input your Password!';
  loading = false;
  stop = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cookie: CookieService,
    private route: ActivatedRoute
  ) { }

  register(): void {
    this.router.navigate(['new']);
  }

  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.status === 'VALID') {
      const user = this.validateForm.value.userName;
      const pass = this.validateForm.value.password;
      this.loading = true;
      this.http
        .post(
          this.URL, { username: user, password: pass }, {})
        .subscribe((data: any) => {
          this.loading = false;
          if (data && data.message && data.message.valide) {
            const keep = this.validateForm.value.remember;
            this.validateForm.reset();
            this.router.navigate(['menu'], {
              queryParams: {
                name: data.message.profile.fname,
                access: data.message.token,
                keep
              }
            });
          } else {
            this.validateForm.reset();
            this.submitForm();
            this.checked = true;
            this.TipUser = 'Invalid username or password !';
            this.TipPass = '';
          }
        }, (err: any) => {
          this.loading = false;
          this.stop = true;
          this.validateForm.reset();
          this.submitForm();
          this.checked = true;
          this.TipUser = 'Le serveur a une erreur réessayer plus tard';
          this.TipPass = '';
        });
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(item => {
      if (item.user) {
        this.router.navigate(['user'], { queryParams: { user: item.user } });
      }
    });
    this.cookie.remove('Saved');
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true],
    });
  }
}
