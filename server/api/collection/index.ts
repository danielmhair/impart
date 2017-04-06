'use strict';
import { Router } from 'express';
import { CollectionCtrl } from './collection.controller';
import * as jwtCheck from '../jwtCheck';

export const CollectionApi = Router();

CollectionApi.get('/', /*jwtCheck, */CollectionCtrl.index);
CollectionApi.post('/', /*jwtCheck, */CollectionCtrl.create);
CollectionApi.put('/:id', /*jwtCheck, */CollectionCtrl.update);
CollectionApi.patch('/:id', /*jwtCheck, */CollectionCtrl.update);
CollectionApi.delete('/:id', /*jwtCheck, */CollectionCtrl.destroy);