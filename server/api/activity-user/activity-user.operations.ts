import { ActivityUser, IActivityUser } from './activity-user.model';
import {ApiCtrl} from "../ApiCtrl";

class ActivityUserOp extends ApiCtrl<IActivityUser> {
  constructor() {
    super(ActivityUser)
  }
}
export const ActivityUserOperations = new ActivityUserOp();