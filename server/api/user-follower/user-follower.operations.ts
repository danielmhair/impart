import {ApiCtrl} from "../ApiCtrl";
import {IUserFollowerModel, UserFollower, IUserFollower, UserFollowerModel} from './user-follower.model';
import {IActivity, IActivityModel} from "../activity/activity.model";
import {IActivityUser, IActivityUserModel, ActivityUser} from "../activity-user/activity-user.model";
import {ActivityUserOperations} from "../activity-user/activity-user.operations"
import {ActivityOperations} from "../activity/activity.operations";
import * as Q from 'q';
import {UserOperations} from "../user/user.operations";
import {IUser, IUserModel} from "../user/user.model";

class UserFollowerOp extends ApiCtrl<IUserFollowerModel, UserFollower> {
  constructor() {
    super(UserFollowerModel)
  }
  public getUsersFollowers(userId: string): Q.Promise<IUserModel[]> {
    return this.getUsersBy({ userId: userId })
  }

  public getWhoUsersFollowing(userId: string): Q.Promise<IUserModel[]> {
    return this.getUsersBy({ followerId: userId })
  }

  private getUsersBy(params: Object): Q.Promise<IUserModel[]> {
    return this.getBy(params)
    .then((user: IUserFollower[]) => {
      return UserOperations.getBy({userId: {$in: user.map(item => item.userId)}})
      .then((users: IUserModel[]) => {
        return users
      })
    })
  }
}

export const UserFollowerOperations = new UserFollowerOp();