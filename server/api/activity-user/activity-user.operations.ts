import {ActivityUser, IActivityUserModel, ActivityUserModel} from './activity-user.model';
import {ApiCtrl} from "../ApiCtrl";

class ActivityUserOp extends ApiCtrl<IActivityUserModel, ActivityUser> {
  constructor() {
    super(ActivityUserModel)
  }
}
export const ActivityUserOperations = new ActivityUserOp();