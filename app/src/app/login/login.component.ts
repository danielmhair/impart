import {Component, OnInit} from '@angular/core';
import { UserService } from '../services';
import { User } from '../models/User';
import {ActivatedRoute, Router} from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { LoginAnimations } from './login.animation';
import { Constants } from '../models/Constants';

@Component({
  selector: `login`,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: LoginAnimations
})
export class LoginComponent implements OnInit {
  model: User = new User('');
  loading: boolean = false;
  success: boolean = false;
  loginMessage: string = '';
  intendedLogout: string = '';
  loggedIn: boolean = false;
  user: User = null;
  users: User[] = null;

  constructor(private userService: UserService,
              private route: ActivatedRoute,
              private router: Router) {}

  public ngOnInit() {
    this.loading = true;
    this.userService.userStream.subscribe(
      (user: User) => {
        console.log(user);
        this.user = user;
        this.loading = false;
        if (this.user && this.userService.isAuthenticated()) {
          console.log("User is logged in!");
          this.router.navigate(["account"]);
        }
      }
    );

    this.route.params.subscribe(params => {
      console.log(params);
      this.loginMessage = params['loginMessage'];
      this.intendedLogout = params['intendedLogout'];

      // 1. Check params from login
      if (params['token'] && params['age'] && params['username']) {
        console.log('Received login info');
        const expirationTime = this.getExpiration(params['age']);
        localStorage.setItem('token', params['token']);
        localStorage.setItem('token_age', expirationTime + '');
        localStorage.setItem('username', params['username']);
      }

      if (this.userService.isAuthenticated()) {
        this.userService.getUser();
      }
    });
  }

  public getExpiration(token_age) {
    // return Math.floor(new Date().getTime() / 1000) + Number(token_age);
    return Number(token_age);
  }

  public loginWith(type: string) {
    console.log("LOGGING IN WITH " + type);
    this.userService.login(type);
  }
}
