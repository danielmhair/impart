import { Activity, IActivity } from './activity.model';
import {ApiCtrl} from "../ApiCtrl";

class ActivityOp extends ApiCtrl<IActivity> {
  constructor() {
    super(Activity)
  }
}
export const ActivityOperations = new ActivityOp();