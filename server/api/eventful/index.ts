'use strict';
import { Router } from 'express';
import { EventfulCtrl } from './eventful.controller';
import * as authenticated from '../jwtCheck';

export const EventfulApi = Router();

EventfulApi.get('/categories', /*authenticated, */EventfulCtrl.getCategories);
EventfulApi.get('/events', /*authenticated, */EventfulCtrl.getEvents);
