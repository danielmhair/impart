import {ApiCtrl} from "../ApiCtrl";
import {IUserFollowerModel, UserFollower, IUserFollower} from './user-follower.model';
import {IActivity, IActivityModel} from "../activity/activity.model";
import {IActivityUser, IActivityUserModel, ActivityUser} from "../activity-user/activity-user.model";
import {ActivityOperations} from "../activity/activity.operations";
import * as Q from 'q';
import {UserOperations} from "../user/user.operations";
import {IUser, IUserModel} from "../user/user.model";

class UserFollowerOp extends ApiCtrl<IUserFollowerModel, UserFollower> {
  constructor() {
    super(UserFollower)
  }

  public getUsersActivites(userId: string): Q.Promise<IActivity[]> {
    return this.getActivitiesBy({userId: userId, isRecommendation: false});
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

  private getActivitiesBy(params: Object): Q.Promise<IActivity[]> {
    return this.getBy(params)
    .then((activityUsers: IActivityUserModel[]) => {
      return ActivityOperations.getBy({userId: {$in: activityUsers.map(item => item.userId)}})
      .then((activities: IActivityModel[]) => {
        return activities
      })
    })
  }
}

export const UserFollowerOperations = new UserFollowerOp();