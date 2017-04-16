import { Schema, model, Model, Document } from 'mongoose';
import {BaseDocument} from "../../models/BaseDocument";

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

export interface IActivityUserModel extends Document {
  activityId: string;
  userId: string;
  isRecommendation: boolean;
}

export const ActivityUserSchema = new Schema({
  activityId: String,
  userId: String,
  isRecommendation: Boolean,
}, { collection: 'ActivityUser' });

export const ActivityUserModel = model('ActivityUser', ActivityUserSchema);
