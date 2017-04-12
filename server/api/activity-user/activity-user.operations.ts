import {ActivityUser, IActivityUserModel, ActivityUserModel} from './activity-user.model';
import {ActivityOperations} from "../activity/activity.operations"
import {IActivity, IActivityModel} from "../activity/activity.model";
import {ApiCtrl} from "../ApiCtrl";

class ActivityUserOp extends ApiCtrl<IActivityUserModel, ActivityUser> {
  constructor() {
    super(ActivityUserModel)
  }

   public getUsersActivities(params: Object): Q.Promise<IActivity[]> {
    return super.getBy(params)
    .then((activityUsers: IActivityUserModel[]) => {
      console.log("THIS PART WORKED: " + activityUsers)
      return ActivityOperations.getBy({userId: {$in: activityUsers.map(item => item.userId)}})
      .then((activities: IActivityModel[]) => {
        return activities
      })
    })
  }
}
export const ActivityUserOperations = new ActivityUserOp();