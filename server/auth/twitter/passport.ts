import * as passport from 'passport';
import * as uuid from 'node-uuid';
import { Utils } from '../../utils';
import { Strategy } from 'passport-twitter';
import * as UserController from  '../../api/user/user.controller';
import { ServerSettings } from '../../config/environment';

class TwitterPassportSetup {
  public setup(User) {
    passport.use(new Strategy({
        consumerKey: ServerSettings.twitter.clientID,
        consumerSecret: ServerSettings.twitter.clientSecret,
        callbackURL: ServerSettings.twitter.callbackURL
      },
      function (token, tokenSecret, profile, done) {
        User.findOne({
          $or: [
            {'twitter.id_str': profile.id}
          ]
        }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            user = new User({
              name: profile.displayName,
              username: profile.username,
              role: 'user',
              provider: 'twitter',
              twitter: profile._json
            });
            if (user._id && !user.nodeEndpoint) {
              user.nodeEndpoint = "https://www.danielmhair.com/api/users/" + user._id + "/rumors";
            }
            if (!user.uuid) {
              user.uuid = uuid.v4();
            }
            if (Utils.getRandom(0, 5) % 3 == 0) {
              user.seed = true;
            }
            UserController.addNeighborAndSave(user)
            .then(function (results) {
              console.log(results);
              done(null, user);
            })
            .catch(function (err) {
              done(err);
            })
          } else {
            user.twitter = profile._json;
            if (user._id && !user.nodeEndpoint) {
              user.nodeEndpoint = "https://www.danielmhair.com/api/users/" + user._id + "/rumors";
            }
            if (!user.uuid) {
              user.uuid = uuid.v4();
            }
            if (Utils.getRandom(0, 5) % 3 == 0) {
              user.seed = true;
            }
            user.save(function (err) {
              if (err) return done(err);
              done(err, user);
            });
          }
        });
      }
    ));
  }
}

export const TwitterPassport = new TwitterPassportSetup();
