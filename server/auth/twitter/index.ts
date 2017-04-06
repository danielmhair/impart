'use strict';

import * as express from 'express';
import * as passport from 'passport';
import * as AuthService from '../auth.service';

export const TwitterApi = express.Router();

TwitterApi
.get('/', passport.authenticate('twitter', {
  failureRedirect: '/signup',
  session: false
}))

.get('/callback', passport.authenticate('twitter', {
  failureRedirect: '/signup',
  session: false
}), AuthService.setTokenCookie);
