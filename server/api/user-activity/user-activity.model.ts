import { Schema, model } from 'mongoose';

let UserActivitySchema = new Schema({
  property: String,
}, { collection: 'UserActivity' });

export const UserActivity = model('UserActivity', UserActivitySchema);
