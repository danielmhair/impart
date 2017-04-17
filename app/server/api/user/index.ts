'use strict';
import * as https from 'https';

import { Router } from 'express';
import { UserController } from './user.controller';
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

// Update 
setInterval(async () => {
  console.log("Creating Recommendations");
  //function one (Andrew)
  //await UserController.functionOne();
  //function two (Josh)
  await UserController.createRecommendations();
}, 5000);
