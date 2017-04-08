import {ApiCtrl} from "../ApiCtrl";
import { IUser, User } from './user.model';

class ActivityUserOp extends ApiCtrl<IUser> {
  constructor() {
    super(User)
  }
}
export const UserOperations = new ActivityUserOp();