import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  modeProfile = false;
  modeSearch = true;

  constructor() { }

  public getName(): string{
    let loc: string = document.location.href;
    let userName = '';
    loc = loc.replace(document.location.origin, '');
    loc = loc.replace(document.location.pathname, '');
    loc.split('&').map(item => {
      if (item.split('=')[0] === 'user'){
        userName = item.split('=')[1];
      }
    });
    return userName;
  }

  ngOnInit(): void {
    if (this.getName() !== ''){
      this.modeProfile = true;
      this.modeSearch = false;
    }
  }

}
