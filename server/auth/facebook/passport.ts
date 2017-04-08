import * as passport from 'passport';
import * as uuid from 'node-uuid';
import { Strategy } from 'passport-facebook';
import { Utils } from '../../utils';
import { UserController } from  '../../api/user/user.controller';
import { ServerSettings } from '../../config/ServerSettings';

class FacebookPassportSetup {
  public setup(User) {
    passport.use(new Strategy({
        clientID: ServerSettings.facebook.clientID,
        clientSecret: ServerSettings.facebook.clientSecret,
        callbackURL: ServerSettings.facebook.callbackURL,
        profileFields: ["id", "email", "first_name", "displayName", "gender", "last_name"]
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOne({
            'facebook.id': profile.id
          },
          function(err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                role: 'user',
                username: profile.username,
                provider: 'facebook',
                facebook: profile._json
              });
              if (user._id && !user.nodeEndpoint) {
                user.nodeEndpoint = "https://www.danielmhair.com/api/users/" + user._id + "/rumors";
              }
              if (!user.uuid) {
                user.uuid = uuid.v4();
              }
              if (Utils.getRandom(0,5) % 3 == 0) {
                user.seed = true;
              }
              UserController.addNeighborAndSave(user)
              .then(function(results) {
                console.log(results);
                done(null, user);
              })
              .catch(function(err) {
                done(err);
              })
            } else {
              user.facebook = profile._json;
              if (user._id && !user.nodeEndpoint) {
                user.nodeEndpoint = "https://www.danielmhair.com/api/users/" + user._id + "/rumors";
              }
              if (!user.uuid) {
                user.uuid = uuid.v4();
              }
              if (Utils.getRandom(0,5) % 3 == 0) {
                user.seed = true;
              }
              user.save(function(err) {
                if (err) return done(err);
                done(err, user);
              });
            }
          })
      }
    ));
  }
}

export const FacebookPassport = new FacebookPassportSetup();