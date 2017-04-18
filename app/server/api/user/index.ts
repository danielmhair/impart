'use strict';
import * as https from 'https';

import { Router } from 'express';
import { UserController } from './user.controller';
import { ActivityUserOperations } from "../activity-user/activity-user.operations";
import * as Q from 'q'

export const UserApi = Router();

UserApi.get('/', UserController.index);
UserApi.get('/:username', UserController.show);
UserApi.post('/', UserController.create);
UserApi.put('/:id', UserController.update);
//UserApi.put('/:id/password', UserController.changePassword);
//UserApi.get('/:id/suggestions', UserController.getSuggestions);
UserApi.get('/me', UserController.me);
UserApi.post('/:id/suggestions', UserController.createSuggestionReq);
UserApi.delete('/:id', UserController.destroy);

//UserApi.get('/:id/activities', UserController.getActivities);

/*setInterval(async () => {
  console.log("Propagating Suggestions");
  await UserController.suggestActivities();
}, 5000);*/

// Update recommendations
setInterval(async () => {
  console.log("Destroying old recommendations and creating new ones");
  //function one (Andrew)
  await ActivityUserOperations.destroyRecommendedTrue();
  //function two (Josh)
  await UserController.createRecommendations();
}, 5000);
