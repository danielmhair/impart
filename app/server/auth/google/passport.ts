import * as passport from 'passport';
import * as uuid from 'node-uuid';
import { OAuth2Strategy } from 'passport-google-oauth';
import { Utils } from '../../utils';
import { UserController } from  '../../api/user/user.controller';
import { ServerSettings } from '../../config/ServerSettings';

class GooglePassportSetup {
  public setup(User) {
    passport.use(new OAuth2Strategy({
        clientID: ServerSettings.google.clientID,
        clientSecret: ServerSettings.google.clientSecret,
        callbackURL: ServerSettings.google.callbackURL
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOne({
          $or: [
            { 'email': profile.emails[0].value },
            { 'google.id': profile.id }
          ]
        }, function(err, user) {
          if (!user) {
            console.log(profile);
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              role: 'user',
              username: profile.emails[0].value.split("@")[0],
              provider: 'google',
              google: profile._json,
              categories: []
            });
            // if (user._id && !user.nodeEndpoint) {
            //   user.nodeEndpoint = "https://www.danielmhair.com/api/users/" + user._id + "/suggestions";
            // }
            if (!user.uuid) {
              user.uuid = uuid.v4();
            }
            console.log(user);
            user.save(function(err) {
              if (err) return done(err);
              done(err, user);
            });
          } else {
            user.google = profile._json;
            // if (user._id && !user.nodeEndpoint) {
            //   user.nodeEndpoint = "https://www.danielmhair.com/api/users/" + user._id + "/suggestions";
            // }
            if (!user.uuid) {
              user.uuid = uuid.v4();
            }
            console.log(user);
            user.save(function(err) {
              if (err) return done(err);
              done(err, user);
            });
          }
        });
      }
    ));
  }
}

export const GooglePassport = new GooglePassportSetup();