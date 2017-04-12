import {ApiCtrl} from "../ApiCtrl";
import {IUserModel, User, UserModel} from './user.model';

class UserOp extends ApiCtrl<IUserModel, User> {
  constructor() {
    super(UserModel)
  }
}
export const UserOperations = new UserOp();