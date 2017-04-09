'use strict';

import { User, IUser } from './user.model';
import { ServerSettings } from '../../config/ServerSettings';
import * as jwt from 'jsonwebtoken';
import * as uuid from 'node-uuid';
import * as Q from 'q'
import { Utils } from '../../utils';
import {HttpRequest} from "../http-request";
// import { Suggestion } from "../../models/Suggestion"
// import { Want } from "../../models/Want"
import { UserOperations } from "../user/user.operations"

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

  // public static getRumors(req, res) {
  //   User.findById(req.params.id, (err, user: IUser) => {
  //     if (err) return res.status(500).send(err);
  //     if (!user) return res.status(404).send("Unable to get user");
  //     return res.status(200).json(user.rumors)
  //   });
  // };

  // public static resolveWant(userId, want) {
  //   return Q.Promise((resolve, reject) => {
  //     User.findById(userId, (err, userWithWant: IUser) => {
  //       if (err) return reject({status: 500, message: err});
  //       if (!userWithWant) return reject({status: 404, message: "Unable to get user"});
  //       User.find({nodeEndpoint: want.EndPoint}, (err, userWithRumor: IUser) => {
  //         if (err) return reject(err)
  //         if (!userWithRumor) return reject({status: 200, data: "User is not found"})
  //         if (!userWithRumor.rumors) userWithRumor.rumors = []
  //         let rumorsToAdd = userWithRumor.rumors
  //         .filter((rumor) => {
  //           let uuids = Object.keys(want.Want);
  //           let messageIdParts = rumor.Rumor.messageID.split(":");
  //           let rumorUuid = messageIdParts[0];
  //           let rumorSequence = messageIdParts[1];
  //           return rumorSequence > want.Want[rumorUuid];
  //         });
  //         userWithWant.rumors = userWithWant.rumors.concat(rumorsToAdd);
  //         userWithWant.save((err) => {
  //           if (err) return reject(err);
  //           return resolve(rumorsToAdd)
  //         })
  //       })
  //     });
  //   });
  // };

  // public static createRumorFromRumor(userId, rumor) {
  //   return Q.Promise((resolve, reject) => {
  //     console.log("CREATING RUMOR FROM RUMOR");
  //     console.log(userId);
  //     console.log(rumor);
  //     console.log(rumor.Rumor.Text)
  //     User.findById(userId, (err, user) => {
  //       if (err) {
  //         console.error(err)
  //         return reject({status: 500, message: err});
  //       }
  //       if (!user) return reject({status: 404, message: "Unable to get user"})
  //       let exists = user.rumors.filter((eaRumor) => {
  //           return eaRumor.Rumor.messageID == rumor.Rumor.messageID
  //         }).length > 0;
  //       console.log("Exists? " + exists)
  //       if (!exists) {
  //         user.rumors.push(rumor);
  //         user.save((err) => {
  //           if (err) return reject({status: 500, message: err});
  //           return resolve(rumor)
  //         })
  //       } else {
  //         return resolve(rumor)
  //       }
  //     });
  //   });
  // };

  // public static createRumorFromMessage(userId, message) {
  //   return Q.Promise((resolve, reject) => {
  //     User.findById(userId, (err, user) => {
  //       if (err) return reject({status: 500, message: err});
  //       if (!user) return reject({status: 404, message: "Unable to get user"});
  //       // const suggest = new Suggestion("user", {}, "string");
  //       // const want = new Want(...);
  //       let text = message;
  //       let originator = user.username;
  //       let maxSequenceNum = UserController.maxSequenceNumber(user.rumors, user.uuid);
  //       let messageId = user.uuid + ":" + (maxSequenceNum + 1);
  //       let rumor = {
  //         Rumor: {
  //           messageID: messageId,
  //           Originator: originator,
  //           Text: text
  //         },
  //         EndPoint: user.nodeEndpoint
  //       };
  //       user.rumors.push(rumor);
  //       user.save((err) => {
  //         if (err) return reject({status: 500, message: err});
  //         return resolve(rumor)
  //       });
  //     });
  //   })
  // };

  // public static resolveRumor(userId, rumor) {
  //   return Q.Promise((resolve, reject) => {
  //     let resultPromise = null;
  //     console.log("Resolving rumor")
  //     console.log(rumor.EndPoint)
  //     User.findOne({nodeEndpoint: rumor.EndPoint}, (err, user) => {
  //       if (err) {
  //         console.log(err)
  //         return reject({status: 500, message: err});
  //       }
  //       if (!user) {
  //         console.log("There is no user, creating new User...")
  //         let newUser = new User({
  //           name: rumor.Rumor.Originator,
  //           username: rumor.Rumor.Originator,
  //           seed: true,
  //           rumors: [rumor],
  //           nodeEndpoint: rumor.EndPoint,
  //           neighbors: [],
  //           uuid: rumor.Rumor.messageID.split(":")[0]
  //         });
  //         console.log("Saving user")
  //         console.log(newUser)
  //         resultPromise = UserController.saveUser(newUser);
  //       } else {
  //         console.log("There is a user")
  //         resultPromise = UserController.createRumorFromRumor(userId, rumor);
  //       }
  //       resultPromise
  //       .then(resolve)
  //       .catch(reject)
  //     });
  //   });
  // }

  // public static createRumorReq(req, res) {
  //   //if the message coming in is a rumor do something
  //   console.log("======================== CREATE RUMOR REQ =========================");
  //   let rumor = req.body.Rumor;
  //   let want = req.body.Want;
  //   let userId = req.params.id;
  //   console.log("Getting user from id: " + userId);
  //   let resultPromise = null;
  //   if (rumor) {
  //     console.log("Creating rumor ")
  //     console.log(rumor.Rumor)
  //     if (!userId) {
  //       console.log("No user, creating user then rumor...")
  //       resultPromise = UserController.resolveRumorWithNoUser(rumor)
  //     } else {
  //       console.log("User exists, update user with new rumor")
  //       resultPromise = UserController.resolveRumor(userId, rumor)
  //     }
  //   } else if (want) {
  //     console.log(want)
  //     resultPromise = UserController.resolveWant(userId, want);
  //   } else {
  //     console.log("Creating rumor...");
  //     console.log(req.body.message);
  //     resultPromise = UserController.createRumorFromMessage(userId, req.body.message);
  //   }

  //   resultPromise
  //   .then((result) => {
  //     res.status(200).json(result)
  //   })
  //   .catch((err) => {
  //     res.status(500).json(err)
  //   })
  // };

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
  // public static create(req, res, next) {
  //   let originator = req.body.originator;
  //   let endpoint = req.body.endpoint;
  //   let newUser = null;
  //   if (originator && endpoint) {
  //     newUser = new User({
  //       nodeEndpoint: endpoint,
  //       username: originator,
  //       name: originator,
  //       role: 'user',
  //     });
  //   } else {
  //     newUser = new User(req.body);
  //     newUser.nodeEndpoint = "https://www.danielmhair.com/api/users/" + newUser._id + "/rumors";
  //     newUser.role = 'user';
  //     newUser.provider = 'local';
  //   }
  //   newUser.uuid = uuid.v4();
  //   newUser.seed = Utils.getRandom(0, 5) % 3 === 0;
  //   if (newUser.provider === "anonymous") {
  //     User.find({username: originator, provider: "anonymous"}, (err, users) => {
  //       if (!err && users && users.length > 0) {
  //         console.log("Found node endpoint with username. Don't need to add user.")
  //         console.log(users)
  //         let token = jwt.sign({_id: users[0]._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
  //         return res.status(200).json({token: token});
  //       } else {
  //         UserController.addNeighborAndSave(newUser)
  //         .then((results) => {
  //           console.log("Neighbors added...")
  //           console.log(results);
  //           let token = jwt.sign({_id: newUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
  //           console.log(token);
  //           return res.status(200).json({token: token});
  //         })
  //         .catch((errResult) => {
  //           return res.status(errResult.status).json(errResult.err);
  //         })
  //       }
  //     })
  //   } else {
  //     UserController.addNeighborAndSave(newUser)
  //     .then((results) => {
  //       console.log("Neighbors added...")
  //       console.log(results);
  //       let token = jwt.sign({_id: newUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
  //       console.log(token);
  //       return res.status(200).json({token: token});
  //     })
  //     .catch((errResult) => {
  //       return res.status(errResult.status).json(errResult.err);
  //     })
  //   }
  // };

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

  public static propagateSuggestions = async () => {
    const users: IUser[] = await UserOperations.getAll();
    console.log(users);
  //   users.forEach((user) => {
  //     console.log("============");
  //     console.log(user.username);
  //     console.log(user.nodeEndpoint);
  //     if (user.neighbors.length > 0 && user.rumors.length > 0) {
  //       let randomNeighborId = user.neighbors[Utils.getRandom(0, user.neighbors.length)];
  //       const neighborUsers = users.filter((neighbor) => {
  //         if (neighbor._id == randomNeighborId) {
  //           console.log("neighbor id is randomNeighbor")
  //           return true
  //         }
  //         return false
  //       });
  //       console.log(neighborUsers)
  //       if (neighborUsers.length == 0) {
  //         console.log("I don't what happened....");
  //       }
  //       let neighborUser = neighborUsers[0]
  //       console.log(randomNeighborId)
  //       if (Utils.getRandom(0, 2) == 0) {
  //         // Prepare a rumor
  //         let randomRumor = user.rumors[Utils.getRandom(0, user.rumors.length)];
  //         // UserController.createRumorFromRumor(randomNeighborId, randomRumor)
  //         console.log("Sending random rumor...")
  //         console.log(randomRumor)
  //         UserController.httpPost(neighborUser.nodeEndpoint, {"Rumor": randomRumor})
  //         .then((response) => {
  //           console.log(response)
  //         })
  //         .catch((err) => {
  //           console.error(err)
  //         })
  //       } else {
  //         // Prepare a want
  //         const Want = UserController.prepareWant(user);
  //         // UserController.resolveWant(randomNeighborId, Want)
  //         console.log("Sending random want...")
  //         console.log(neighborUser)
  //         UserController.httpPost(neighborUser.nodeEndpoint, {"Want": Want})
  //         .then((response) => {
  //           console.log(response)
  //         })
  //         .catch((err) => {
  //           console.error(err)
  //         })
  //       }
  //     }
  //   })
  };

  public static prepareWant(user) {
    let Want = {
      "Want": {},
      "EndPoint": user.nodeEndpoint
    };

    Utils.uniqueItems(
      user.rumors.map((rumor) => {
        return parseInt(rumor.Rumor.messageID.split(":")[0])
      })
    ).forEach((uuid) => {
      Want.Want[uuid] = UserController.maxSequenceNumber(user.rumors, uuid);
    });

    return Want;
  }

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

  public static maxSequenceNumber(rumors, uuid) {
    return rumors
    .filter((rumor) => {
      return rumor.Rumor.messageID.split(":")[0] === uuid
    })
    .map((rumor) => {
      return parseInt(rumor.Rumor.messageID.split(":")[1])
    })
    .reduce((a, b) => {
      return Math.max(a, b);
    }, [])
  }


  public static httpPost(url, body) {
    return HttpRequest.post(url, body);
  }

  public static validationError(res, err) {
    return res.status(422).json(err);
  };
}