import { Injectable } from "@angular/core";
import {UserService} from "./user.service";
import {Http} from "@angular/http";
import {User} from "../models/User";
import {ApiStream} from "../services/api/api-stream.service";
import {Constants} from "../models/Constants";
import {EventfulCategory} from "../models/EventfulCategory"
import {BehaviorSubject} from "rxjs";

@Injectable()
export class Eventful {
  public baseUrl: string = Constants.EVENTFUL_API;
  public categories = new BehaviorSubject<EventfulCategory[]>([]);
  private user: User = null;

  constructor(protected http: Http, protected userService: UserService) {
    userService.userStream
    .subscribe((user: User) => {
      this.user = user;
    });
  }

  public getCategories() {
    return new Promise<EventfulCategory[]>((resolve, reject) => {
      const categories = this.categories.getValue();
      if (categories && categories.length > 0) {
        return resolve(categories)
      }

      this.http.get(`${Constants.EVENTFUL_API}/categories`)
      .map(res => res.json())
      .subscribe(
        (categories: EventfulCategory[]) => {
          this.categories.next(categories);
          resolve(categories);
        },
        err => {
          console.error(err);
          reject(err)
        }
      )
    })
  }
}
