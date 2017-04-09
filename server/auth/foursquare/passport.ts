import * as passport from 'passport';
import * as uuid from 'node-uuid';
import { Utils } from '../../utils';
import { Strategy } from 'passport-foursquare';
import { UserController } from  '../../api/user/user.controller';
import { ServerSettings } from '../../config/ServerSettings';

class FoursquarePassportSetup {
  public setup(User) {
    passport.use(new Strategy(
      {
        clientID: ServerSettings.foursquare.clientID,
        clientSecret: ServerSettings.foursquare.clientSecret,
        callbackURL: ServerSettings.foursquare.callbackURL
      },
      (accessToken, refreshToken, profile, done) => {
        console.log(accessToken)
        User.findOne({
          $or: [
            { 'email': profile.emails[0].value },
            { 'foursquare.id': profile.id }
          ]
        },
        (err, user) => {
          if (!user) {
            console.log(profile);
            user = new User({
              name: profile.name.givenName + ' ' + profile.name.familyName,
              email: profile.emails[0].value,
              role: 'user',
              username: profile.emails[0].value.split('@')[0],
              provider: profile.provider,
              foursquare: profile._json.response.user
            });
            user.foursquare.token = accessToken;
            if (user._id) {
              user.nodeEndpoint = "https://www.danielmhair.com/api/users/" + user._id + "/rumors";
            }
            if (Utils.getRandom(0,5) % 3 == 0) {
              user.seed = true;
            }
            user.uuid = uuid.v4();
            console.log(user.foursquare)
            // UserController.addNeighborAndSave(user)
            // .then((results) => {
            //   console.log(results);
            //   done(null, user);
            // })
            // .catch((err) => {
            //   done(err);
            // })
          } else {
            if (user._id && !user.nodeEndpoint) {
              user.nodeEndpoint = "https://www.danielmhair.com/api/users/" + user._id + "/rumors";
            }
            if (!user.uuid) {
              user.uuid = uuid.v4();
            }
            if (Utils.getRandom(0,5) % 3 == 0) {
              user.seed = true;
            }
            if (!user.foursquare) {
              user.foursquare = profile._json.response.user;
              user.foursquare.token = accessToken;
              console.log(user.foursquare)
              user.save((err) => {
                if (err) return done(err);
                console.log("No foursquare - user saved.")
                done(err, user)
              });
            } else {
              user.foursquare.token = accessToken;
              user.save((err) => {
                if (err) return done(err);
                console.log("user saved")
                console.log(user)
                done(err, user)
              })
            }
          }
        });
      }
    ));
  }
}

export const FoursquarePassport = new FoursquarePassportSetup();

