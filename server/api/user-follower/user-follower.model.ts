import { Schema, model, Document } from 'mongoose';
import {BaseDocument} from "../../models/BaseDocument";

export class UserFollower extends BaseDocument {
  followerId: string;
  userId: string;

  constructor(followerId: string, userId: string, id?: string) {
    super(id);
    this.followerId = followerId;
    this.userId = userId;
  }
}

export interface IUserFollower extends BaseDocument {
  followerId: string;
  userId: string;
}

export interface IUserFollowerModel extends Document {
  followerId: string;
  userId: string;
}


let UserFollowerSchema = new Schema({
  // _id is already included
  followerId: String,
  userId: String
}, { collection: 'UserFollowerSchema' });

export const UserFollowerModel = model('UserFollowerSchema', UserFollowerSchema);
