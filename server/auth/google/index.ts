'use strict';

import * as express from 'express';
import * as passport from 'passport';
import { AuthService } from '../auth.service';
import { ServerSettings } from '../../config/environment';

export const GoogleApi = express.Router();

GoogleApi
.get('/', passport.authenticate('google', {
  failureRedirect: '/signup',
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  session: false
}))
.get('/callback', passport.authenticate('google', {
  failureRedirect: '/signup',
  session: false
}), AuthService.setTokenCookie);