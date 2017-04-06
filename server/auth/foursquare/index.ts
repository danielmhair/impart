'use strict';

import * as express from 'express';
import * as passport from 'passport';
import * as AuthService from '../auth.service';

export const FoursquareApi = express.Router();

FoursquareApi
.get('/', passport.authenticate('foursquare', {
  failureRedirect: '/signup',
  session: false
}), (res, req) => {})
.get('/callback', passport.authenticate('foursquare', {
  failureRedirect: '/signup',
  session: false
}), AuthService.setTokenCookie);