import { Component } from '@angular/core';
import {Router} from '@angular/router';


// 'http://localhost/PHP%20workspace/Ougly/api.php'
export const URL = document.location.origin + '/api.php';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent{
  constructor(private router: Router) {}
}
