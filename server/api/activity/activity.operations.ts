import { Activity, IActivityModel } from './activity.model';
import {ApiCtrl} from "../ApiCtrl";

class ActivityOp extends ApiCtrl<IActivityModel, Activity> {
  constructor() {
    super(Activity)
  }
}
export const ActivityOperations = new ActivityOp();