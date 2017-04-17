'use strict';
import { Router } from 'express';
import { ActivityUserCtrl } from './activity-user.controller';
import * as authenticated from '../jwtCheck';

export const ActivityUserApi = Router();

ActivityUserApi.get('/', /*authenticated, */ActivityUserCtrl.index);
ActivityUserApi.post('/:id', /*authenticated, */ActivityUserCtrl.create);
ActivityUserApi.put('/:id', /*authenticated, */ActivityUserCtrl.update);
ActivityUserApi.patch('/:id', /*authenticated, */ActivityUserCtrl.update);
ActivityUserApi.delete('/:id', /*authenticated, */ActivityUserCtrl.destroy);