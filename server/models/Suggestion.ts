import {Activity, IActivity} from "../api/activity/activity.model";

export class Suggestion {
  public userId: string;
  public activity: Activity|IActivity;
  public endpoint: string;

  constructor(userId: string, activity: Activity|IActivity, endpoint: string) {
    this.userId = userId;
    this.activity = activity;
    this.endpoint = endpoint;
  }
}