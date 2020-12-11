import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { URL } from '../app.component';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  URL = URL;
  validateForm!: FormGroup;
  @Input() id: number | undefined;

  constructor(private http: HttpClient, private fb: FormBuilder) { }

  private postMessage(value: string, title: string): void{
    this.validateForm.reset();
    this.http.post(this.URL, {id: this.id, post: value, title}).subscribe((data: any) => {
    }, (err: any) => {});
  }

  public send(): void{
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.status === 'VALID') {
      const title = this.validateForm.value.title;
      const content = this.validateForm.value.content;
      this.postMessage(content, title);
    }
  }


  ngOnInit(): void {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
      content: [null, [Validators.required]],
    });
  }

}
