'use strict';

import * as express from 'express';
import * as passport from 'passport';
import * as AuthService from '../auth.service';
import { ServerSettings } from '../../config/environment';

export const FacebookApi = express.Router();

FacebookApi
.get('/', passport.authenticate('facebook', {
  scope: ['email', 'user_about_me'],
  failureRedirect: ServerSettings.appUrl + '#/login?loginMessage=Unable to login with facebook&intendedLogout=false',
  session: false
}))
.get('/callback', passport.authenticate('facebook', {
  failureRedirect: ServerSettings.appUrl + '#/login?loginMessage=Unable to login with facebook&intendedLogout=false',
  session: false
}), AuthService.setTokenCookie);
