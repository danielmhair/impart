import {ApiCtrl} from "../ApiCtrl";
import {IUserModel, User, UserModel} from './user.model';

class ActivityUserOp extends ApiCtrl<IUserModel, User> {
  constructor() {
    super(UserModel)
  }
}
export const UserOperations = new ActivityUserOp();