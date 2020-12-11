import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie';
import {URL} from '../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {

  private URL = URL;
  validateForm!: FormGroup;
  loading = false;
  ErrorC = 'Le champ est vide !';
  ErrorP = 'Le champ est vide !';
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cookie: CookieService,
    private router: Router
  ) { }

  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.status === 'VALID') {
      this.http.post(this.URL, {name: this.validateForm.value.userName, pass: this.validateForm.value.password, reg: true})
      .subscribe((data: any) => {
        if (data && data.message){
          if (!data.message.valide){
            this.ErrorC = 'Nom de compte déjà utiliser';
            this.ErrorP = '';
            this.validateForm.reset();
            this.submitForm();
          }else{
            this.validateForm.reset();
            this.router.navigate(['/']);
          }
        }else{
          this.ErrorC = 'Le serveur a une erreur réessayer plus tard';
          this.validateForm.reset();
          this.submitForm();
        }
      }, (err: any) => {
        this.ErrorC = 'Le serveur a une erreur réessayer plus tard';
        this.validateForm.reset();
        this.submitForm();
      });
    }
  }

  ngOnInit(): void {
    this.cookie.remove('Saved');
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }

}
