'use strict';
import { Router } from 'express';
import { UserFollowerCtrl } from './user-follower.controller';
import * as jwtCheck from '../jwtCheck';

export const UserFollowerApi = Router();

UserFollowerApi.get('/', /*jwtCheck, */UserFollowerCtrl.index);
UserFollowerApi.post('/', /*jwtCheck, */UserFollowerCtrl.create);
UserFollowerApi.post('/:id', /*jwtCheck, */UserFollowerCtrl.create);
UserFollowerApi.put('/:id', /*jwtCheck, */UserFollowerCtrl.update);
UserFollowerApi.patch('/:id', /*jwtCheck, */UserFollowerCtrl.update);
UserFollowerApi.delete('/:id', /*jwtCheck, */UserFollowerCtrl.destroy);