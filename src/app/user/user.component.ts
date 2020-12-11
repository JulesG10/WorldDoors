import {  HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URL } from '../app.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  private URL = URL;
  Search = true;
  User: string | undefined;
  options: string[] = [];
  ActualValue = '';
  Loading = false;
  Infos: any = [];
  NoImage = false;
  public Color = 'purple';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  public ConnexionLevel(value: number): void{
    const c = value;
    if (c > 0){
      this.Color = 'purple';
    }
    if (c > 5){
      this.Color = 'blue';
    }
    if (c > 10){
      this.Color = 'bluegeek';
    }
    if (c > 15){
      this.Color = 'cyan';
    }
    if (c > 20){
      this.Color = 'green';
    }
    if (c > 25){
      this.Color = 'lime';
    }
    if (c > 30){
      this.Color = 'gold';
    }
    if (c > 35){
      this.Color = 'orange';
    }
    if (c > 40){
      this.Color = 'volcano';
    }
    if (c > 45){
      this.Color = 'red';
    }
    if (c > 50){
      this.Color = 'magenta';
    }
  }

  public getUserInfos(): void{
    this.http.get(this.URL + '?userInfos=' + this.User).subscribe((data: any) => {
      if (!data.error && data.message){
        if (data.message.isset){
          this.Infos = data.message;
          this.ConnexionLevel(this.Infos.connexion);
        }else{
          this.Search = true;
          this.router.navigate(['user']);
        }
      }else{
        this.Search = true;
        this.router.navigate(['user']);
      }
    }, (err) => {
      this.Search = true;
      this.router.navigate(['user']);
    });
  }

  public submit(value: string): void{
    this.router.navigate(['user'], {queryParams: {user: value}});
  }

  private SearchUser(value: string): void {
    this.http.get(this.URL + '?searchUser=' + value).subscribe((data: any) => {
      if (!data.error && data.message){
        this.options = data.message;
      }
    }, (err: any) => {});
  }

  public onImgError(e: any): void{
    e.path[1].remove();
    this.NoImage = true;
  }

  public onInput(e: any, value: string): void{
    if (value.split(' ').length > 0){
      value.split(' ').map(item => {
        this.SearchUser(item);
      });
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(item => {
      if (item.user){
        this.Search = false;
        this.User = item.user;
        this.getUserInfos();
      }
    });
  }

}
