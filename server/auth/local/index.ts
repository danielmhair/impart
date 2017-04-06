'use strict';

import * as express from 'express';
import * as passport from 'passport';
import * as AuthService from '../auth.service';

export const LocalApi = express.Router();

LocalApi.post('/', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    const error = err || info;
    if (error) return res.status(401).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});

    const token = AuthService.signToken(user._id);
    res.json({token: token});
  })(req, res, next)
});