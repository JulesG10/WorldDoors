import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie';
import {URL} from '../app.component';

export interface CardView {
  id?: number;
  like?: boolean;
  description?: string;
  title?: string;
  image?: string;
}


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})

export class MenuComponent implements OnInit, AfterViewInit {
  private URL = URL;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  dir = 'Menu';
  LastDir = 'Menu';
  Id = 0;
  LastLoc = 'chose';
  Loc = 'chose';
  Option: any = {chose: true, setting: false, message: false, users: false, hist: false, post: false};
  TOKEN: string | undefined = undefined;
  Username: string | undefined = undefined;
  StatusFace = 'smile';
  FaceClickCountTrofy = 0;
  FaceClickCountNumber = 0;
  DefaultSelectedUser = '';
  Keep = false;
  Co: any = [];

    public nav(nav: string): void{
      this.router.navigate([nav]);
    }

  changeStatus(): void {
    if (this.StatusFace === 'smile') {
      this.StatusFace = 'meh';
    } else if (this.StatusFace === 'meh') {
      this.StatusFace = 'frown';
    } else if (this.StatusFace === 'frown') {
      this.StatusFace = 'smile';
    } else {
      this.StatusFace = 'smile';
    }
    this.FaceClickCountNumber++;
    this.FaceClickCountTrofy++;
    if (this.FaceClickCountTrofy === 10) {
      this.StatusFace = 'trophy';
      this.FaceClickCountTrofy = 0;
    }
    if (this.FaceClickCountNumber === 20) {
      this.StatusFace = 'number';
      this.FaceClickCountNumber = 0;
    }
  }

  private ValideUser(name: string | undefined, id: number | undefined): void {
    if (name === undefined || id === undefined) {
      this.cookieService.remove('Saved');
      this.router.navigate(['/']);
    } else {
      this.http.post(this.URL, { name, id }).subscribe((data: any) => {
        if (data.error || data.message.valide) {
          this.cookieService.remove('Saved');
          this.router.navigate(['/']);
        } else {
          this.Id = id;
          this.Username = name;
        }
      }, (err: any) => {
        this.cookieService.remove('Saved');
        this.router.navigate(['/']);
      });
    }
  }

  public goBack(): void{
    this.LastLoc = 'chose';
    this.LastDir = 'Menu';
    this.dir = 'Menu';
    this.Loc = 'chose';
    Object.keys(this.Option).map(key => {
        this.Option[key] = false;
    });
    this.Option.chose = true;
  }

  public go(page: string, loc: string): void{
    this.LastDir = this.dir;
    this.dir = page;
    this.LastLoc = this.Loc;
    this.Loc = loc;
    Object.keys(this.Option).map(key => {
          this.Option[key] = key === loc ? true : false;
    });
  }

  private Verify(): void {
    if (this.TOKEN !== undefined && this.Username !== undefined) {
      this.http
        .post(this.URL, { token: this.TOKEN, username: this.Username }, {})
        .subscribe(
          (data: any) => {
            if (!data.error && data.message.valide) {
              if (this.Keep) {
                this.cookieService.putObject('Saved', { name: this.Username, id: data.message.id, keep: true }, {});
              }
            } else {
              if (data.error) {
                this.cookieService.remove('Saved');
                this.router.navigate(['/']);
              } else {
                if (!this.cookieService.hasKey('Saved')) {
                  this.router.navigate(['/']);
                } else {
                  try {
                    const keep = JSON.parse(this.cookieService.get('Saved'));
                    const name = keep.name;
                    const id = keep.id;
                    this.ValideUser(name, id);
                  } catch {
                    this.ValideUser(undefined, undefined);
                  }
                }
              }
            }
          },
          (err: any) => {
            if (!this.cookieService.hasKey('Saved')) {
              this.router.navigate(['/']);
            }
          }
        );
    } else {
      if (!this.cookieService.hasKey('Saved')) {
        this.router.navigate(['/']);
      }
    }
  }

  ngAfterViewInit(): void {
    this.Verify();
  }

  private getConnexion(): void{
    this.http.get(this.URL + '?connexion=' + this.Username).subscribe((data: any) => {
      if (!data.error && data.message){
        this.Co = data.message;
      }
    }, (err: any) => {});
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((item) => {
      if (item.access) {
        this.TOKEN = item.access;
      }
      if (item.name) {
        this.Username = item.name;
        this.getConnexion();
      }
      if (item.keep) {
        this.Keep = item.keep === 'true' ? true : false;
      }
      if (item.user){
        this.Option.user = true;
        this.DefaultSelectedUser = item.user;
      }
    });
  }
}

  /*
  CARD_LIST: CardView[] = [{
    id: 0,
    title: 'Mon titre',
    description: 'Ma super description',
    image: ''
  }];

  DisLike(id: any): void {
    this.CARD_LIST = this.CARD_LIST.filter((item) => item.id !== id);
  }

  Like(id: any): void {
    const NEW_CARD_LIST: any[] = [];
    this.CARD_LIST.map((item) => {
      if (item.id === id) {
        const it = { ...item, like: true };
        NEW_CARD_LIST.push(it);
      } else {
        NEW_CARD_LIST.push(item);
      }
    });
    this.CARD_LIST = NEW_CARD_LIST;
  }*/
