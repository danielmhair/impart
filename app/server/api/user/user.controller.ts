'use strict';

import {User, IUser, IUserModel, UserModel} from './user.model';
import { ServerSettings } from '../../config/ServerSettings';
import * as jwt from 'jsonwebtoken';
import * as uuid from 'node-uuid';
import * as _ from 'lodash';
import * as Q from 'q';
import { Utils } from '../../utils';
import {HttpRequest} from "../http-request";
import { Want } from "../../models/Want"
import { Suggestion } from "../../models/Suggestion"
import { UserOperations } from "../user/user.operations"

import { IActivityModel, ActivityModel, IActivity, Activity } from '../activity/activity.model';
import { ActivityOperations } from "../activity/activity.operations";

import { ActivityUserModel, ActivityUser, IActivityUserModel, IActivityUser } from '../activity-user/activity-user.model';
import { ActivityUserOperations } from "../activity-user/activity-user.operations";

import { UserFollower, IUserFollower, IUserFollowerModel } from '../user-follower/user-follower.model';
import { UserFollowerOperations } from "../user-follower/user-follower.operations";

import { Eventful } from '../eventful/eventful.controller';
import { EventfulEvent, EventfulEventParams } from '../../models/Eventful';

export class UserController {
  /**
   * Get list of users
   * restriction: 'admin'
   */
  public static index(req, res) {
    UserModel.find({}, '-salt -hashedPassword', (err, users: IUser[]) => {
      if (err) return res.status(500).send(err);
      res.status(200).json(users);
    });
  };

  // Updates an existing state in the DB.
  public static update(req, res) {
    if(req.body._id) { delete req.body._id; }
    UserModel.findById(req.params.id, function (err, document: IUserModel) {
      if (err) { return res.status(500).send(err); }
      if(!document) { return res.status(404).send('Not Found'); }
      let updated = _.merge(document, req.body);
      updated.categories = req.body.categories;
      updated.markModified('categories');
      updated.save(function (err) {
        if (err) { return res.status(500).send(err); }
        console.log("saved no erros");
        return res.status(200).json(updated);
      });
    });
  }

  // public static getSuggestions(req, res) {
  //   UserModel.findById(req.params.id, (err, user: IUser) => {
  //     if (err) return res.status(500).send(err);
  //     if (!user) return res.status(404).send("Unable to get user");
  //     return res.status(200).json(user.suggestions)
  //   });
  // };
  // public static getActivities(req, res) {
  //   UserModel.findById(req.params.id, (err, user: IUser) => {
  //     if (err) return res.status(500).send(err);
  //     if (!user) return res.status(404).send("Unable to get user");
  //     return res.status(200).json(user.activities)
  //   });
  // };

  /*
   * Query Eventful with a location (city, state UT), categories (string = categories with commas), date (string = This Week)
   * Take the results and create an Activity and ActivityUser Connection
  */
  public static createRecommendations = async () => {
    //For each user query eventful
    const users: IUserModel[] = await UserOperations.getAll();
    users.forEach( async (user: IUserModel) => {
      console.log("user");
      console.log(user.username);

      //query eventful
      const eventfulEventParams: EventfulEventParams = new EventfulEventParams(/*user.location*/"Provo,UT", "This Week", user.categories.join(',').toString());
      Eventful.getEvents(eventfulEventParams)
      .then((response: {status: number, data: any, response: any}) => {
        const eventfulResponse = JSON.parse(response.data);
        const events = eventfulResponse.events;
        //Create an activity for each event that was returned
        //console.log(events);
        events.event.forEach( async (event: any) => {
          // I think we should store the start, end time and all day true or false, the event id.
          //console.log("===================EVENT=============================")
          // console.log(event);
          const activity: IActivity = new Activity(event.title, event.description, event.venue_address, "Eventful", [], event);
          ActivityOperations.create(activity)
          .then((activity: IActivity) => {
            console.log("===================ACTIVITY=============================")
            console.log(activity);
            //Create activity user
            const activityUser: IActivityUser = new ActivityUser(activity._id, user._id, true);
            ActivityUserOperations.create(activityUser)
            .then((activityUser: IActivityUser) => {
              console.log("===================ACTIVITY USER=============================")
              console.log(activityUser);
            })
            .catch((err) => {
              console.log("error creating activity user");
              console.log(err);
            });
          })
          .catch((err) => {
            console.log("error creating activity");
            console.log(err);
          });
        });
      })
      .catch((err) => {
        console.log("error getting eventful events");
        console.log(err);
      });
    });
  }

  /** createSuggestionFromWant
   * Check the categories in the want and compare it to all the user's activities
   * send a random one that matches
   */
  public static createSuggestionFromWant(followerId: string, want: Want) {
    return Q.Promise((resolve, reject) => {
      UserOperations.getById(followerId)
      .then((userWithWant: IUser) => {
        if (!userWithWant) return reject({status: 404, message: "Unable to get user"});
        console.log(want.userId)
         UserOperations.getById(want.userId)
         .then(async (userWithActivity: IUser) => {
           //let userWithActivity: IUserModel = null;
           if (!userWithActivity) {
             return reject({status: 404, data: "No users are not found"});
           }
          const activities: IActivity[] = await ActivityUserOperations.getUsersActivities({userId: followerId});
          const activitiesWithMatchingCategories: IActivity[] = activities.filter(activity => {
            return activity.categories.filter(activityCategory => {
                return want.categories.indexOf(activityCategory) >= 0
            }).length > 0
          });

          if (activitiesWithMatchingCategories.length < 1) {
            return reject({status: 200, data: "No matching categories"});
          }
          const randomActivity: IActivity = activitiesWithMatchingCategories[Utils.getRandom(0, activitiesWithMatchingCategories.length)];
          UserController.createSuggestionFromActivity(want.userId, randomActivity)
          .then(resolve)
          .catch(err => reject({ status: 500, err: err}));
        })
        .catch(err => reject({ status: 500, err: err }));
      })
      .catch(err => reject({ status: 500, err: err}));
    })
  };

   public static createSuggestionFromActivity (userId: string, activity: Activity) {
     return Q.Promise (async(resolve, reject) => {
       console.log("CREATING SUGGESTION FROM SUGGESTION");
       console.log("THIS USER IS LOOKING AT A SUGGESTION: " + userId + ": ");
       console.log(activity);
       // Just check if an activity_user connection is needed
       UserOperations.getById(userId)
       .then(async (user: IUserModel) => {
          if (!user) return reject({status: 404, message: "Unable to get user with id: " + userId + "to create acivity-user"});
          const activities: IActivity[] = await ActivityUserOperations.getUsersActivities({userId: userId, isRecommendation: false});
          console.log(activities);
          //check if there is already a relation between the user and this activity.
          let exists = activities.filter((eactivity: IActivity) => {
            //make sure to check the event ID to see if the user already has the event wrapped in another activity
             if(activity.event){
               return String(activity.event.id) == String(eactivity.event.id)
             } else {
               return String(activity._id) == String(eactivity._id)
             }
          }).length > 0;

          //make sure one or more of the categories also match.
          let matches = user.categories.filter((eaCategory) => {
            return activity.categories.indexOf(eaCategory) >= 0
          }).length > 0;

          console.log("Exists? " + exists);
          console.log("Matches? " + matches);
          // if the user is not already associated with the activity, and the activity matches one or more of his categories
          if (!exists && matches) {
            const activityUser: IActivityUser = new ActivityUser(activity._id, userId, false);
            console.log(activityUser);
            //create the connection between user and activity
            ActivityUserOperations.create(activityUser)
            .then((document: IActivityUserModel) => resolve(document))
            .catch((err) => reject({status: 500, err: err}));
          } else {
            console.log("SUGGESTION THROWN OUT BECAUSE IT ALREADY EXISTS OR DOESN'T MATCH ANY CATEGORIES");
            return resolve(activity)
          }
       })
       .catch(err => {
         console.error(err);
         return reject({status: 500, message: err});
       });
     });
   };

  public static createNewSuggestionFromActivity(userId, activity: Activity) {
     return Q.Promise((resolve, reject) => {
       UserOperations.getById(userId)
       .then((user: IUser) => { // <= Verify the user exists...
         if (!user) return reject({status: 404, message: "Unable to get user"});
         console.log(activity);
         //create the activity in the database
         ActivityOperations.create(activity)
         .then((createdActivity: IActivity) => {
           console.log(createdActivity);
           //using the resulting document create the activity-user connection
           const activityUser: IActivityUser = new ActivityUser(createdActivity._id, userId, false);
           ActivityUserOperations.create(activityUser)
           .then((createdActivityUser: IActivityUserModel) => {
             console.log(createdActivityUser);
             return resolve(createdActivityUser);
           })
           .catch((err) => reject({status: 500, err: err}));
         })
         .catch((err) => reject({ status: 500, err: err }))
       })
       .catch((err) => reject({status: 500, err: err}));
    });
  };

  public static createSuggestionReq(req, res) {
    //if the message coming in is a suggestion do something
    console.log("======================== CREATE SUGGESTION REQ =========================");
    let activity: Activity = req.body.activity;
    let want: Want = req.body.want;
    let userId: string = req.params.id;

    return Q.Promise((resolve, reject) => {
      console.log("Getting user from id: " + userId);
      let resultPromise = null;
      if (activity) {
        console.log("Creating activity ");
        console.log(activity);
        if (!userId) {
          return reject({ status: 404, err: "Unable to find user" })
        }
        console.log("User exists, update user with incoming activity");
        resultPromise = UserController.createSuggestionFromActivity(userId, activity)
      } else if (want) {
        console.log(want);
        resultPromise = UserController.createSuggestionFromWant(userId, want);
      } else {
        console.log("There is no suggestion or want.");
        return res.status(400).send("Bad Request: Did not find a suggestion or want to create")
      }
      return resultPromise
      .then((result) => {
        res.status(200).json(result)
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err)
      })
    })
  }

  /**
    * Creates a new user
    */
  public static create(req, res, next) {
    console.log("creating a new user");
    const username = req.body.username;
    const name = req.body.name;
    const newUser: User = new User(username, name);
    console.log(username);
    console.log(name);
    newUser.uuid = uuid.v4();
    // newUser.nodeEndpoint = "https://www.localhost:3008/api/users/" + newUser.uuid + "/suggestions";
    // newUser.role = 'user';
    newUser.provider = 'local';

    console.log(newUser);
    UserOperations.create(newUser)
    .then((createdUser: IUserModel) => {
      console.log("New user added");
      console.log(createdUser);
      let token = jwt.sign({_id: createdUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
      console.log(token);
      return res.status(200).json({token: token});
    })
    .catch((err) => {
      console.log("error creating a new user");
      console.log(err);
      return res.status(500).json(err);
    })
  };

  /**
   * Get a single user
   */
  public static show = (req, res, next) => {
    let username = req.params.username;

    UserModel.findOne({username: username}, (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).send('Unauthorized');
      res.status(200).json(user);
    });
  };

  /**
   * Deletes a user
   * restriction: 'admin'
   */
  public static destroy(req, res) {
    UserModel.findByIdAndRemove(req.params.id, (err, user) => {
      if (err) return res.status(500).send(err);
      return res.status(204).send('No Content');
    });
  };

  /**
   * Change a users password
   */
  // public static changePassword(req, res, next) {
  //   let userId = req.user._id;
  //   let oldPass = String(req.body.oldPassword);
  //   let newPass = String(req.body.newPassword);

  //   UserModel.findById(userId, (err, user) => {
  //     if (user.authenticate(oldPass)) {
  //       user.password = newPass;
  //       user.save((err) => {
  //         if (err) return UserController.validationError(res, err);
  //         res.status(200).send('OK');
  //       });
  //     } else {
  //       res.status(403).send('Forbidden');
  //     }
  //   });
  // };

  /**
   * Get my info
   */
  public static me(req, res, next) {
    let userId = req.user._id;
    UserModel.findOne({
      _id: userId
    }, '-salt -hashedPassword', (err, user) => { // don't ever give out the password or salt
      if (err) return next(err);
      if (!user) return res.status(401).send('Unauthorized');
      res.json(user);
    });
  };

  /**
   * Authentication callback
   */
  private authCallback = (req, res, next) => {
    res.redirect('/');
  };

  public static suggestActivities = async () => {
    const users: IUserModel[] = await UserOperations.getAll();
    users.forEach( async (user: IUserModel) => {

      // Get the current user's followers
      const followers: IUserModel[] = await UserFollowerOperations.getUsersFollowers(user._id);

      // Get all of the activities for the current user
      const activities: IActivity[] = await ActivityUserOperations.getUsersActivities({userId: user._id, isRecommendation: false});

      console.log("============");
      console.log("users");
      console.log(users);
      console.log("current user: ");
      console.log(user);
      console.log("username: " + user.username);
      console.log("user id: " + user._id);
      console.log("followers:");
      console.log(followers);
      console.log("activities");
      console.log(activities);
      console.log("============");

      // We only need to propagate if the user has followers and activities
      if (followers.length > 0 && activities.length > 0) {
        let randomFollower = followers[Utils.getRandom(0, followers.length)];

        // Find the user that matches the random follower id
        const followerArray: IUserModel[] = users.filter((follower: IUserModel) => {
          return String(follower._id) == String(randomFollower._id);
        });

        // Safety check that there is a follower in the array
        console.log(followerArray);
        if (followerArray.length == 0) {
          console.log("No follower for user " + user.email + "...");
        }

        let follower: IUser = followerArray[0];
        console.log('Random follower id:' + randomFollower);

        // Randomly pick to send a suggestion or a want
        if (Utils.getRandom(0, 2) == 0) {

          // // Prepare a suggestion from the users activities
          // let randomSuggestion = activities[Utils.getRandom(0, activities.length)];

          // Prepare a suggestion from the users activities
          // TODO Make sure this suggestion matches one of the user's categories
          // Maybe like this?
          const suggestionsMatchingUsers: IActivity[] = activities.filter(activity => {
            return activity.categories.filter(activityCategory => {
              return follower.categories.indexOf(activityCategory) >= 0
            }).length > 0
          });

          const randSuggestionIdx = Utils.getRandom(0, suggestionsMatchingUsers.length);
          let randomSuggestion = suggestionsMatchingUsers[randSuggestionIdx];

          // UserController.createRumorFromRumor(randomNeighborId, randomRumor)
          console.log("Sending random suggestion...");
          console.log(randomSuggestion);
          const suggestion: Activity = new Activity(randomSuggestion.name, randomSuggestion.description,
                                          randomSuggestion.address, user._id, randomSuggestion.categories,
                                          randomSuggestion.event);
          UserController.createSuggestionFromActivity(user._id, suggestion)
          .then(console.log)
          .catch(console.error);
        } else {
          // Prepare a want
          const want = new Want(user.categories, user._id);
          console.log("Sending random want to follower...");
          console.log(want);
          console.log(follower);
          UserController.createSuggestionFromWant(follower._id, want)
          .then(console.log)
          .catch(console.error)
        }
      }
    });
  };

  public static saveUser(user) {
    return Q.Promise((resolve, reject) => {
      user.save((err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        else resolve(user)
      })
    });
  }

}
