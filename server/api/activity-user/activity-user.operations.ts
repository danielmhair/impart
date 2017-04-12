import { ActivityUser, IActivityUserModel } from './activity-user.model';
import {ApiCtrl} from "../ApiCtrl";

class ActivityUserOp extends ApiCtrl<IActivityUserModel, ActivityUser> {
  constructor() {
    super(ActivityUser)
  }
}
export const ActivityUserOperations = new ActivityUserOp();