'use strict';
import { Router } from 'express';
import { UserActivityCtrl } from './user-activity.controller';
import * as jwtCheck from '../jwtCheck';

export const UserActivityApi = Router();

UserActivityApi.get('/', /*jwtCheck, */UserActivityCtrl.index);
UserActivityApi.post('/', /*jwtCheck, */UserActivityCtrl.create);
UserActivityApi.put('/:id', /*jwtCheck, */UserActivityCtrl.update);
UserActivityApi.patch('/:id', /*jwtCheck, */UserActivityCtrl.update);
UserActivityApi.delete('/:id', /*jwtCheck, */UserActivityCtrl.destroy);