import { Schema, model, Document } from 'mongoose';

export interface IUserFollower extends Document {
  followerId: string;
  userId: string;
}

let UserFollowerSchema = new Schema({
  // _id is already included
  followerId: String,
  userId: String
}, { collection: 'UserFollowerSchema' });

// To get people following you, search by { userId: userId }
// To get people your following, search by { followerId: userId }
//   userId   followerId
//     1           2
//     1           5
//     1           6
//     1           7
//     2           4
//     2           5
//     2           6
//     2           7


export const UserFollower = model('UserFollowerSchema', UserFollowerSchema);
