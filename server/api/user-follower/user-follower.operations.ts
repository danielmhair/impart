import {ApiCtrl} from "../ApiCtrl";
import {IUserFollower, UserFollower} from './user-follower.model';
import {IActivity} from "../activity/activity.model";
import {IActivityUser} from "../activity-user/activity-user.model";
import {ActivityOperations} from "../activity/activity.operations";
import * as Q from 'q';
import {UserOperations} from "../user/user.operations";
import {IUser} from "../user/user.model";

class UserFollowerOp extends ApiCtrl<IUserFollower> {
  constructor() {
    super(UserFollower)
  }

  public getUsersActivites(userId: string): Q.Promise<IActivity[]> {
    return this.getActivitiesBy({userId: userId, isRecommendation: false});
  }

  public getUsersFollowers(userId: string): Q.Promise<IUser[]> {
    return this.getUsersBy({ userId: userId })
  }

  public getWhoUsersFollowing(userId: string): Q.Promise<IUser[]> {
    return this.getUsersBy({ followerId: userId })
  }

  private getUsersBy(params: Object): Q.Promise<IUser[]> {
    return this.getBy(params)
    .then((activityUsers: IActivityUser[]) => {
      return UserOperations.getBy({userId: {$in: activityUsers.map(item => item.userId)}})
      .then((users: IUser[]) => {
        return users
      })
    })
  }

  private getActivitiesBy(params: Object): Q.Promise<IActivity[]> {
    return this.getBy(params)
    .then((activityUsers: IActivityUser[]) => {
      return ActivityOperations.getBy({userId: {$in: activityUsers.map(item => item.userId)}})
      .then((activities: IActivity[]) => {
        return activities
      })
    })
  }
}

export const UserFollowerOperations = new UserFollowerOp();