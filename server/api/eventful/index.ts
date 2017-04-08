'use strict';
import { Router } from 'express';
import { EventfulCtrl } from './eventful.controller';
import * as jwtCheck from '../jwtCheck';

export const EventfulApi = Router();

EventfulApi.get('/:username', /*jwtCheck, */EventfulCtrl.getByUsername);
// Optional
// EventfulApi.get('/', /*jwtCheck, */EventfulCtrl.index);
// EventfulApi.post('/', /*jwtCheck, */EventfulCtrl.create);
// EventfulApi.put('/:id', /*jwtCheck, */EventfulCtrl.update);
// EventfulApi.patch('/:id', /*jwtCheck, */EventfulCtrl.update);
// EventfulApi.delete('/:id', /*jwtCheck, */EventfulCtrl.destroy);