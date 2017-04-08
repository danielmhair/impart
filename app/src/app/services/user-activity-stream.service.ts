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
  private categories: EventfulCategory[] = [];

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

  public getAll(): Promise<UserActivity[]> {
    this.loading = true;
    const getAll = super.getAll();
    getAll.then(
      data => this.loading = false,
      err => this.loading = false
    );
    return getAll
  }

  public getCategories() {
    return new Promise<EventfulCategory[]>((resolve, reject) => {
      if (this.categories && this.categories.length > 0) {
        return resolve(this.categories)
      }

      this.http.get(`http://api.eventful.com/json/categories/list?app_key=${Constants.EVENTFUL_APP_KEY}`)
      .map(res => res.json())
      .subscribe(
        (categories: EventfulCategory[]) => {
          this.categories = categories;
          console.log(this.categories);
          resolve(this.categories);
        },
        err => {
          console.error(err);
          reject(err)
        }
      )
    })
  }
}
