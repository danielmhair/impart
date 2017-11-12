import {ActivityUser, IActivityUserModel, ActivityUserModel, IActivityUser} from './activity-user.model';
import {ActivityOperations} from "../activity/activity.operations"
import {IActivity, IActivityModel} from "../activity/activity.model";
import {ApiCtrl} from "../ApiCtrl";
import * as Q from 'q'

class ActivityUserOp extends ApiCtrl<IActivityUserModel, ActivityUser> {
  constructor() {
    super(ActivityUserModel)
  }

   public getUsersActivities(params: Object): Q.Promise<IActivity[]> {
    return super.getBy(params)
    .then((activityUsers: IActivityUserModel[]) => {
      return ActivityOperations.getBy({_id: {$in: activityUsers.map(item => item.activityId)}})
      .then((activities: IActivityModel[]) => {
        return activities
      })
    })
  }

  public destroyRecommendedTrue(): Q.Promise<string[]> {
    return super.getBy({isRecommendation : true})
    .then((activityUsers: IActivityUserModel[]) =>{
      let promises = [];
      activityUsers.forEach((activityUser: IActivityUserModel) => {
        promises.push(this.destroy(activityUser._id));
        promises.push(ActivityOperations.destroy(activityUser.activityId))
      });
      return Q.all(promises)
    })
  }
  /*public destroyRecommendedTrue(){
    return Q.Promise((resolve, reject) => {
      super.getBy({isRecommendation : true})
      .then((activityUsers: IActivityUserModel[]) =>{
        console.log("got to this point")
        let promises = []
        activityUsers.forEach(activityUser => {
          promises.push(this.destroy(activityUser._id))
          promises.push(ActivityOperations.destroy(activityUser.activityId))
        })
        Q.all(promises).then(resolve).catch(reject)
      })
    })
  }*/
}
export const ActivityUserOperations = new ActivityUserOp();