import { Schema, model, Model, Document } from 'mongoose';

export interface IActivityUser extends Document {
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

export const ActivityUser = model('ActivityUser', ActivityUserSchema);
