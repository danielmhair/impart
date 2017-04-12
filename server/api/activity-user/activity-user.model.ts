import { Schema, model, Model, Document } from 'mongoose';
import {BaseDocument} from "../../models/BaseDocument";

export interface IActivityUser extends BaseDocument {
  activityId: string;
  userId: string;
  isRecommendation: boolean;
}

export class ActivityUser extends BaseDocument {
  activityId: string;
  userId: string;
  isRecommendation: boolean;

  constructor(activityId: string, userId: string, isRecommendation: boolean, id?: string) {
    super(id);
    this.activityId = activityId;
    this.userId = userId;
    this.isRecommendation = isRecommendation;
  }
}

export interface IActivityUserModel extends Document {
  _id: string;
  activityId: string;
  userId: string;
  isRecommendation: boolean;
}

export const ActivityUserSchema = new Schema({
  // _id is already included
  activityId: String,
  userId: String,
  isRecommendation: Boolean,
}, { collection: 'ActivityUser' });

export const ActivityUserModel = model('ActivityUser', ActivityUserSchema);
