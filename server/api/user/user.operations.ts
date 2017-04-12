import {ApiCtrl} from "../ApiCtrl";
import { IUserModel, User } from './user.model';

class ActivityUserOp extends ApiCtrl<IUserModel, User> {
  constructor() {
    super(User)
  }
}
export const UserOperations = new ActivityUserOp();