'use strict';

import * as jwt from 'jsonwebtoken';
import * as expressJwt from 'express-jwt';
import * as compose from 'composable-middleware';
import { ServerSettings } from '../config/environment';
import { UserModel } from '../api/user/user.model';
const validateJwt = expressJwt({ secret: ServerSettings.secrets.session });

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
export const isAuthenticated = () => {
  return compose()
  // Validate jwt
  .use((req, res, next) => {
    // allow access_token to be passed through query parameter as well
    if(req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }
    validateJwt(req, res, next);
  })
  // Attach user to request
  .use((req, res, next) => {
    UserModel.findById(req.user._id, (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).send('Unauthorized');

      req.user = user;
      next();
    });
  });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export const hasRole = (roleRequired) => {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
  .use(this.isAuthenticated())
  .use((req, res, next) => {
    if (ServerSettings.userRoles.indexOf(req.user.role) >= ServerSettings.userRoles.indexOf(roleRequired)) {
      next();
    }
    else {
      res.status(403).send('Forbidden');
    }
  });
}

/**
 * Returns a jwt token signed by the app secret
 */
export const signToken = (id) => {
  return jwt.sign({ _id: id }, ServerSettings.secrets.session, { expiresIn: ServerSettings.tokenAgeInMinutes });
}

/**
 * Set token cookie directly for oAuth strategies
 */
export const setTokenCookie = (req, res) => {
  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.'});
  console.log(req.user);

  let token = this.signToken(req.user._id);
  res.cookie('token', token);
  const expiration = this.dateAdd(Date.now(), "minute", ServerSettings.tokenAgeInMinutes).getTime() / 1000;
  console.log(expiration);
  const params = [
    'token=' + token,
    'age=' + expiration,
    'username=' + req.user.username
  ];
  res.redirect(ServerSettings.appUrl + '#/login;' + params.join(";"));
}

export const dateAdd = (date, interval, units) => {
  let ret = new Date(date); //don't change original date
  switch(interval.toLowerCase()) {
    case 'year'   :  ret.setFullYear(ret.getFullYear() + units);  break;
    case 'quarter':  ret.setMonth(ret.getMonth() + 3*units);  break;
    case 'month'  :  ret.setMonth(ret.getMonth() + units);  break;
    case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
    case 'day'    :  ret.setDate(ret.getDate() + units);  break;
    case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
    case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
    case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
    default       :  ret = undefined;  break;
  }
  return ret;
}
