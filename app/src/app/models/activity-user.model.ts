import {BaseDocument} from "../../../server/models/BaseDocument";

export interface IActivityUser extends BaseDocument {
  activityId: string;
  userId: string;
  isRecommendation: boolean;
}

export class ActivityUser implements IActivityUser {
  public _id: string;
  public activityId: string;
  public userId: string;
  public isRecommendation: boolean;

  constructor(activityId: string, userId: string, isRecommendation: boolean) {
    this.activityId = activityId;
    this.userId = userId;
    this.isRecommendation = isRecommendation;
  }
}
