import {ApiCtrl} from "../ApiCtrl";
import { IUserFollower, UserFollower } from './user-follower.model';

class UserFollowerOp extends ApiCtrl<IUserFollower> {
  constructor() {
    super(UserFollower)
  }
}
export const UserFollowerOperations = new UserFollowerOp();