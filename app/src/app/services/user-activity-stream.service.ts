import { Injectable } from "@angular/core";
import {UserService} from "./user.service";
import {Http} from "@angular/http";
import {User} from "../models/User";
import {ApiStream} from "../services/api/api-stream.service";
import {UserActivity} from "../models/UserActivity";
import {Constants} from "../models/Constants";
import {EventfulCategory} from "../models/EventfulCategory"

@Injectable()
export class UserActivityStream extends ApiStream<UserActivity> {
  public baseUrl: string = Constants.USER_ACTIVITIES_API;
  public ready: boolean = false;
  public loading: boolean = false;
  private user: User = null;

  constructor(http: Http, userService: UserService) {
    super(http, userService);

    userService.userStream
    .subscribe((user: User) => {
      this.user = user;
      if (this.user) {
        this.getAll().then(data => console.log(data), err => console.error(err))
      }
    });
  }
}
