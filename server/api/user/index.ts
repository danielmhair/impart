'use strict';
import * as https from 'https';

import { Router } from 'express';
import { UserController } from './user.controller';

export const UserApi = Router();

UserApi.get('/', UserController.index);
UserApi.get('/:username', UserController.show);
//UserApi.put('/:id/password', UserController.changePassword);
UserApi.get('/:id/suggestions', UserController.getSuggestions);
UserApi.get('/me', UserController.me);

//UserApi.post('/:id/rumors', UserController.createRumorReq);
UserApi.post('/', UserController.create);
UserApi.delete('/:id', UserController.destroy);

setInterval(() => {
  console.log("Propagating Suggestions");
  UserController.propagateSuggestions();
}, 5000);