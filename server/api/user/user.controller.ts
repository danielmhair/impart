'use strict';

import { User, IUser } from './user.model';
import { ServerSettings } from '../../config/ServerSettings';
import * as jwt from 'jsonwebtoken';
import * as uuid from 'node-uuid';
import * as Q from 'q';
import { Utils } from '../../utils';
import {HttpRequest} from "../http-request";
import { Suggestion } from "../../models/Suggestion"
import { Want } from "../../models/Want"
import { UserOperations } from "../user/user.operations"

import { Activity, IActivity } from '../activity/activity.model';
import { ActivityOperations } from "../activity/activity.operations";

import { ActivityUser, IActivityUser } from '../activity-user/activity-user.model';
import { ActivityUserOperations } from "../activity-user/activity-user.operations";

import { UserFollower, IUserFollower } from '../user-follower/user-follower.model';
import { UserFollowerOperations } from "../user-follower/user-follower.operations";

export class UserController {
  /**
   * Get list of users
   * restriction: 'admin'
   */
  public static index(req, res) {
    User.find({}, '-salt -hashedPassword', (err, users: IUser[]) => {
      if (err) return res.status(500).send(err);
      res.status(200).json(users);
    });
  };

  // public static getSuggestions(req, res) {
  //   User.findById(req.params.id, (err, user: IUser) => {
  //     if (err) return res.status(500).send(err);
  //     if (!user) return res.status(404).send("Unable to get user");
  //     return res.status(200).json(user.suggestions)
  //   });
  // };

  /** resolveWant
   * Check the categories in the want and compare it to all the user's activities
   * send a random one that matches
   * Look at Andrew's matches
   */
  public static resolveWant(userId, want) {

    return Q.Promise((resolve, reject) => {

      User.findById(userId, (err, userWithWant: IUser) => {

        if (err) return reject({status: 500, message: err});
        if (!userWithWant) return reject({status: 404, message: "Unable to get user"});

        User.find({nodeEndpoint: want.EndPoint}, (err, userWithActivities: IUser) => {

          if (err) return reject(err);
          if (!userWithActivities) return reject({status: 200, data: "User is not found"});
          //if (!userWithActivities.rumors) userWithActivities.rumors = [];
          //activities: IActivity[] = UserOperations.getCa
          // let rumorsToAdd = userWithActivities.rumors
          // .filter((rumor) => {
          //   let uuids = Object.keys(want.Want);
          //   let messageIdParts = rumor.Rumor.messageID.split(":");
          //   let rumorUuid = messageIdParts[0];
          //   let rumorSequence = messageIdParts[1];
          //   return rumorSequence > want.Want[rumorUuid];
          // });
          // userWithWant.rumors = userWithWant.rumors.concat(rumorsToAdd);
          // userWithWant.save((err) => {
          //   if (err) return reject(err);
          //   return resolve(rumorsToAdd)
          // })
        });

      });

    });

  };

   public static createSuggestionFromSuggestion(userId, suggestion) {
     return Q.Promise ((resolve, reject) => {
       console.log("CREATING SUGGESTION FROM SUGGESTION");
       console.log("THIS USER IS LOOKING AT A SUGGESTION: " + userId + ": ");
       console.log(suggestion);
       User.findById(userId, async (err, user) => {
          if (err) {
            console.error(err)
            return reject({status: 500, message: err});
          }
          if (!user) return reject({status: 404, message: "Unable to get user with id: " + userId + "to create acivity-user"})
          const activities: IActivity[] = await UserFollowerOperations.getUsersActivites(userId);
          
          //check if there is already a relation between the user and this activity.
          let exists = activities.filter((activity: IActivity) => {
            return activity._id == suggestion.activity._id
            }).length > 0

          //make sure one or more of the categories also match.
          let matches = user.categories.filter((eaCategory) => {
            suggestion.activity.categories.indexOf(eaCategory) >= 0
            }).length > 0;

          console.log("Exists? " + exists)
          console.log("Matches? " + matches)
          // if the user is not already associated with the activity, and the activity matches one or more of his categories
          if (!exists && matches) {
            const activityUser: IActivityUser = {
              activityId: suggestion.activity._id,
              userId: userId,
              isRecommendation: false
            } 
            //create the connection between user and activity
            ActivityUserOperations.create(activityUser)
            .then((document: IUserFollower) => resolve(document))
            .catch((err) => {
              return reject({status: 500, err: err});
            })
          } else {
            console.log("SUGGESTION THROWN OUT BECAUSE IT ALREADY EXISTS OR DOESN'T MATCH ANY CATEGORIES")
            return resolve(suggestion)
          }
       });
     });
   };

  public static createSuggestionFromMessage(userId, body) {
     return Q.Promise((resolve, reject) => {
       User.findById(userId, (err, user) => {
        if (err) return reject({status: 500, message: err});
        if (!user) return reject({status: 404, message: "Unable to get user"});
          //const suggest = new Suggestion("user", {}, "string");
          //const want = new Want(...);
        let name = body.name;
        let description = body.description;
        let address = body.address;
        let categories = body.categories;
        let event = body.event;
        const activity : IActivity = {
          name: body.name,
          description: body.messageId,
          address: body.originator,
          categories: body.categories,
          event : body.event
        }
        //create the activity in the database
        ActivityOperations.create(activity)
        .then((createdActivity: IActivity) => {
          console.log(createdActivity);
          //using the resulting document create the activity-user connection
          const activityUser : IActivityUser = {
            activityId: createdActivity._id,
            userId: userId,
            isRecommendation: false,
          }
          ActivityUserOperations.create(activityUser)
          .then((createdActivityUser: IActivityUser)  => {
            console.log(createdActivityUser);
            return resolve(createdActivityUser);
          })
          .catch((err) => {
            return reject({status: 500, err: err});
          })
        })
        .catch((err) => {
          return reject({status: 500, err: err});
        })
      });
    })
  };

  public static resolveSuggestion(userId, suggestion) {
    return Q.Promise((resolve, reject) => {
      let resultPromise = null;
      console.log("Resolving Suggestion")
      User.findById(userId, (err, user)  => {
        if (err) {
          console.log(err)
          return reject({status: 500, message: err});
        }
        if (!user) {
          return reject({status: 404, message: "User not found"})
        } else {
          console.log("There is a user")
          resultPromise = UserController.createSuggestionFromSuggestion(userId, suggestion);
        }
        resultPromise
        .then((results) => {
          console.log(results);
          return resolve(results);
        })
        .catch((err) => {
          return reject({status: 500, err: err});
        })
      });
    });
  }

  public static createRumorReq(req, res) {
    //if the message coming in is a rumor do something
    console.log("======================== CREATE RUMOR REQ =========================");
    let suggestion = req.body.Suggestion;
    let want = req.body.Want;
    let userId = req.params.id;
    console.log("Getting user from id: " + userId);
    let resultPromise = null;
    if (suggestion) {
      console.log("Creating suggestion ")
      console.log(suggestion.Suggestion)
      if (!userId) {
        res.status(404).send("Unable to find user")
      } else {
        console.log("User exists, update user with incoming suggestion")
        resultPromise = UserController.resolveSuggestion(userId, suggestion)
      }
    } else if (want) {
      console.log(want)
      //not finished refactoring resolveWant yet
      //resultPromise = UserController.resolveWant(userId, want);
    } else {
      console.log("Creating rumor from a message from the client");
      console.log(req.body.message);
      resultPromise = UserController.createSuggestionFromMessage(userId, req.body);
    }

    resultPromise
    .then((result) => {
      res.status(200).json(result)
    })
    .catch((err) => {
      res.status(500).json(err)
    })
  };

  // public static resolveRumorWithNoUser(rumor) {
  //   return UserController.createAnonymous(rumor.Rumor.Originator, rumor.EndPoint)
  //   .then((newUser: IUser) => {
  //     return UserController.resolveRumor(newUser._id, rumor)
  //   })
  // }

  // public static addNeighborAndSave(newUser) {
  //   console.log("Adding neighbor and saving");
  //   return Q.Promise((resolve, reject) => {
  //     if (newUser.seed) {
  //       // Put all the other seeds as its neighbors and give me to them as a neighbor
  //       User.find({seed: true}, (err, users) => {
  //         if (err) {
  //           console.error(err);
  //           return reject({status: 500, message: err});
  //         }
  //         if (!users) return reject({status: 404, err: "Unable to get users."});

  //         let operations = [];
  //         users.forEach((user) => {
  //           if (newUser._id != user._id) {
  //             if (user.neighbors.indexOf(newUser._id) == -1) {
  //               user.neighbors.push(newUser._id);
  //               operations.push(UserController.saveUser(user))
  //             }
  //             if (newUser.neighbors.indexOf(user._id) == -1) {
  //               //user not in neighbors
  //               newUser.neighbors.push(user._id);
  //               operations.push(UserController.saveUser(newUser))
  //             }
  //           }
  //         });

  //         Q.all(operations)
  //         .then((results) => {
  //           console.log(results);
  //           return resolve(results);
  //         })
  //         .catch((err) => {
  //           console.error(err);
  //           return reject({status: 500, err: err});
  //         })
  //       })
  //     } else {
  //       console.log("Not a seed");
  //       User.find({seed: true}, (err, users) => {
  //         if (err) return reject({status: 500, err: err});
  //         if (!users) return reject({status: 404, err: "Unable to get users."})

  //         // Add one of the seeds as its neighbor
  //         if (users.length > 0) {
  //           let index = Utils.getRandom(0, users.length);
  //           let user = users[index];
  //           console.log(index);
  //           console.log(users);
  //           newUser.neighbors.push(user._id);
  //           // The seed user will have this new user as a neighbor
  //           user.neighbors.push(newUser._id);

  //           Q.all([
  //             UserController.saveUser(newUser),
  //             UserController.saveUser(user)
  //           ])
  //           .then((results) => {
  //             console.log(results);
  //             return resolve(users);
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             return reject({status: 500, err: err});
  //           })
  //         } else {
  //           console.log("no seeds, default to seed");
  //           //if there are no seeds yet, default this guy to seed.
  //           newUser.seed = true;

  //           UserController.saveUser(newUser)
  //           .then((user) => {
  //             return resolve(user);
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             return reject({status: 500, err: err});
  //           })
  //         }
  //       })
  //     }
  //   })
  // }

  /**
   * Creates a new user
   */
  // public static createAnonymous(originator, endpoint) {
  //   return Q.Promise((resolve, reject) => {
  //     let newUser = null;
  //     if (originator && endpoint) {
  //       newUser = new User({
  //         nodeEndpoint: endpoint,
  //         username: originator,
  //         name: originator,
  //         role: 'user',
  //         provider: 'anonymous'
  //       });
  //     }
  //     newUser.uuid = uuid.v4();
  //     newUser.seed = Utils.getRandom(0, 5) % 3 === 0;
  //     User.find({username: originator, provider: "anonymous"}, (err, users) => {
  //       if (!err && users && users.length > 0) {
  //         console.log("Found node endpoint with username. Don't need to add user.")
  //         console.log(users)
  //         const token = jwt.sign({_id: users[0]._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
  //         return resolve({token: token});
  //       } else {
  //         UserController.addNeighborAndSave(newUser)
  //         .then((results) => {
  //           console.log("Neighbors added...")
  //           console.log(results);
  //           const token = jwt.sign({_id: newUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
  //           console.log(token);
  //           return resolve({token: token});
  //         })
  //         .catch((errResult) => {
  //           return reject(errResult.err);
  //         })
  //       }
  //     })
  //   })
  // };

  /**
   * Creates a new user
   */
  public static create(req, res, next) {
    console.log("create");
    let originator = req.body.originator;
    let endpoint = req.body.endpoint;
    let newUser = null;
    if (originator && endpoint) {
      newUser = new User({
        nodeEndpoint: endpoint,
        username: originator,
        name: originator,
        role: 'user',
      });
    } else {
      newUser = new User(req.body);
      //newUser.nodeEndpoint = "https://www.danielmhair.com/api/users/" + newUser._id + "/rumors";
      newUser.nodeEndpoint = "https://www.danielmhair.com/api/users/" + newUser._id + "/suggestions";
      newUser.role = 'user';
      newUser.provider = 'local';
    }
    newUser.uuid = uuid.v4();
    newUser.seed = Utils.getRandom(0, 5) % 3 === 0;
    if (newUser.provider === "anonymous") {
      User.find({username: originator, provider: "anonymous"}, (err, users) => {
        if (!err && users && users.length > 0) {
          console.log("Found node endpoint with username. Don't need to add user.")
          console.log(users)
          let token = jwt.sign({_id: users[0]._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
          return res.status(200).json({token: token});
        } else {
          // UserController.addNeighborAndSave(newUser)
          // .then((results) => {
          //   console.log("Neighbors added...")
          //   console.log(results);
          //   let token = jwt.sign({_id: newUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
          //   console.log(token);
          //   return res.status(200).json({token: token});
          //  })
          // .catch((errResult) => {
          //   return res.status(errResult.status).json(errResult.err);
          // })
        }
      })
    } else {
      // UserController.addNeighborAndSave(newUser)
      // .then((results) => {
      //   console.log("Neighbors added...")
      //   console.log(results);
      //   let token = jwt.sign({_id: newUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
      //   console.log(token);
      //   return res.status(200).json({token: token});
      //  })
      // .catch((errResult) => {
      //   return res.status(errResult.status).json(errResult.err);
      // })
    }
  };

  /**
   * Get a single user
   */
  public static show = (req, res, next) => {
    let username = req.params.username;

    User.findOne({username: username}, (err, user) => {
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
    User.findByIdAndRemove(req.params.id, (err, user) => {
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

  //   User.findById(userId, (err, user) => {
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
    User.findOne({
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

  public static suggestActivitiesToOtherUsers = async () => {
    const users: IUser[] = await UserOperations.getAll();
    users.forEach( async (user) => {

      // Get the current user's followers
      const followers: IUser[] = await UserFollowerOperations.getUsersFollowers(user._id);

      // Get all of the activities for the current user
      const activities: IActivity[] = await UserFollowerOperations.getUsersActivites(user._id);

      console.log("============");
      console.log("users");
      console.log(users);
      console.log("current user: ");
      console.log(user);
      console.log("username: " + user.username);
      console.log("user endpoint: " + user.nodeEndpoint);
      console.log("followers:");
      console.log(followers);
      console.log("activities");
      console.log(activities);
      console.log("============");

      // We only need to propagate if the user has followers and activities
      if (followers.length > 0 && activities.length > 0) {

        let randomFollowerId = followers[Utils.getRandom(0, followers.length)];

        // Find the user that matches the random follower id
        const followerArray: IUser[] = users.filter((follower) => {
          return follower._id == randomFollowerId;
        });

        // Safety check that there is a follower in the array
        console.log(followerArray);
        if (followerArray.length == 0) {
          console.log("No follower for user " + user.email + "...");
          // TODO Will we need to use continue here to skip this user since there is no follower?
        }

        let follower: IUser = followerArray[0];
        console.log('Random follower id:' + randomFollowerId);

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

          HttpRequest.post(follower.nodeEndpoint, {"Suggestion": randomSuggestion})
          .then((response) => console.log(response))
          .catch((err) => console.error(err));
        } else {
          // Prepare a want
          const want = new Want(user.categories, user.nodeEndpoint); 
          // UserController.resolveWant(randomNeighborId, Want)
          console.log("Sending random want to...");
          console.log(follower);

          HttpRequest.post(follower.nodeEndpoint, {"Want": Want})
          .then((response) => console.log(response))
          .catch((err) => console.error(err));
        }
      }
    });
  };

  // public static prepareWant(user) {
  //   let Want = {
  //     "Categories": user.categories,
  //     "EndPoint": user.nodeEndpoint
  //   };

  //   Utils.uniqueItems(
  //     user.rumors.map((rumor) => {
  //       return parseInt(rumor.Rumor.messageID.split(":")[0])
  //     })
  //   ).forEach((uuid) => {
  //     Want.Want[uuid] = UserController.maxSequenceNumber(user.rumors, uuid);
  //   });

  //   return Want;
  // }

  public static saveUser(user) {
    return Q.Promise((resolve, reject) => {
      user.save((err) => {
        if (err) {
          console.error(err)
          reject(err);
        }
        else resolve(user)
      })
    });
  }

  // public static maxSequenceNumber(rumors, uuid) {
  //   return rumors
  //   .filter((rumor) => {
  //     return rumor.Rumor.messageID.split(":")[0] === uuid
  //   })
  //   .map((rumor) => {
  //     return parseInt(rumor.Rumor.messageID.split(":")[1])
  //   })
  //   .reduce((a, b) => {
  //     return Math.max(a, b);
  //   }, [])
  // }


  public static httpPost(url, body) {
    return HttpRequest.post(url, body);
  }

  public static validationError(res, err) {
    return res.status(422).json(err);
  };
}