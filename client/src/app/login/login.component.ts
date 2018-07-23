import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {UserService} from '../_services/user.service';
import {map} from "rxjs/operators";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';
  showSpinner = false;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    const currentUser = this.userService.getUser();
    if (!!currentUser.name) {
      this.username = currentUser.name;
      this.authenticate();
    }
  }

  authenticate() {
    if (!this.username || !this.username.trim().length) {
      alert('Please provide valid user name!');
      return;
    }
    this.showSpinner = true;
    this.userService.login(this.username).pipe(map(_ => {
      this.showSpinner = false;
      this.router.navigate(['/conversation']);
    }))
    .subscribe();
  }
}
