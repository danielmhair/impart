import { Injectable } from "@angular/core";
import {UserService} from "./user.service";
import {Http} from "@angular/http";
import {User} from "../models/User";
import {ApiStream} from "../services/api/api-stream.service";
import {Constants} from "../models/Constants";
import {EventfulCategory} from "../models/EventfulCategory"
import {Activity} from "../models/activity.model";
import * as Q from 'q';
import {BehaviorSubject} from "rxjs";
import {ActivityUser} from "../models/activity-user.model";

@Injectable()
export class ActivityStream {
  public loading: boolean = false;
  public activities: Activity[] = [];

  constructor(private http: Http, private userService: UserService) {
    userService.userStream
    .subscribe((user: User) => {
      if (user) {
        this.getActivitiesByUserId(user._id)
        .subscribe((activities: Activity[]) => this.activities = activities)
      }
    });
  }

  public getActivitiesByUserId(userId: string) {
    this.loading = true;
    return this.http.get(`${Constants.ACTIVITIES_API}/${userId}`)
    .map(res => res.json())
  }

  public create(activity: Activity) {
    return Q.Promise((resolve, reject) => {
      console.log("CREATING ACTIVITIES: ", activity);
      this.http.post(`${Constants.USER_ACTIVITIES_API}/${activity.originalUser}`, activity)
      .map(res => res.json())
      .subscribe((result: { activity: Activity, activityUser: ActivityUser }) => {
        console.log(result.activity);
        console.log(result.activityUser);
        resolve(result);
      }, reject)
    })
  }

  public followUser(activity: Activity, user: User) {
    return Q.Promise((resolve, reject) => {
      this.http.post(`${Constants.USER_FOLLOWER_API}/${activity.originalUser}`, { followerId: user._id })
      .map(res => res.json())
      .subscribe(resolve, reject)
    })
  }
}
