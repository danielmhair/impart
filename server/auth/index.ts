'use strict';

import { Router } from 'express';
import * as passport from 'passport';
import { ServerSettings } from '../config/ServerSettings';
import { UserModel } from '../api/user/user.model';

import {LocalPassport} from './local/passport';
import {FacebookPassport} from './facebook/passport';
import {GooglePassport} from './google/passport';
import {TwitterPassport} from './twitter/passport';
import {FoursquarePassport} from './foursquare/passport';

import {LocalApi} from './local';
import {FacebookApi} from './facebook';
import {TwitterApi} from './twitter';
import {GoogleApi} from './google';
import {FoursquareApi} from './foursquare';

// Passport Configuration
LocalPassport.setup(UserModel);
FacebookPassport.setup(UserModel);
GooglePassport.setup(UserModel);
TwitterPassport.setup(UserModel);
FoursquarePassport.setup(UserModel);

export const AuthApi = Router();

AuthApi.use('/local', LocalApi);
AuthApi.use('/facebook', FacebookApi);
AuthApi.use('/twitter', TwitterApi);
AuthApi.use('/google', GoogleApi);
AuthApi.use('/foursquare', FoursquareApi);
