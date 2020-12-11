import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { URL } from '../app.component';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  Loading = false;
  options = [];
  private URL = URL;
  CARD: any = [];

  constructor(private http: HttpClient) { }

  public submit(value: string): void {
    this.getPosts(value);
  }

  private getPosts(value: string): void{
    this.http.get(this.URL + '?posts=' + value).subscribe((data: any) => {
      if (!data.error && data.message){
        this.CARD = data.message;
      }
    }, (err: any) => {this.CARD = []; });
  }

  private Search(value: string): void {
    this.Loading = true;
    this.http.get(this.URL + '?searchPost=' + value).subscribe((data: any) => {
      if (!data.error && data.message) {
        this.options = data.message;
      }
      this.Loading = false;
    }, (err: any) => {
      this.Loading = false;
      this.options = [];
    });
  }

  public onInput(e: any, value: string): void {
    value.split(' ').map(item => {
      this.Search(item);
    });
  }

  ngOnInit(): void {
  }

}
