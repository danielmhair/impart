'use strict';
import { Router } from 'express';
import { ActivityCtrl } from './activity.controller';
import * as authenticated from '../jwtCheck';

export const ActivityApi = Router();

ActivityApi.get('/', /*authenticated, */ActivityCtrl.index);
ActivityApi.post('/', /*authenticated, */ActivityCtrl.create);
ActivityApi.put('/:id', /*authenticated, */ActivityCtrl.update);
ActivityApi.patch('/:id', /*authenticated, */ActivityCtrl.update);
ActivityApi.delete('/:id', /*authenticated, */ActivityCtrl.destroy);