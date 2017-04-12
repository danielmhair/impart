import {Activity, IActivityModel, ActivityModel} from './activity.model';
import {ApiCtrl} from "../ApiCtrl";

class ActivityOp extends ApiCtrl<IActivityModel, Activity> {
  constructor() {
    super(ActivityModel)
  }
}
export const ActivityOperations = new ActivityOp();