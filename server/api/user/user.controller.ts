'use strict';

import { IUser, UserModel } from './user.model';
import * as passport from 'passport';
import { ServerSettings } from '../../config/environment';
import * as jwt from 'jsonwebtoken';
import * as https from 'https';
import * as request from 'request';
import * as uuid from 'node-uuid';
import * as Q from 'q'
import { Utils } from '../../utils';

/**
 * Get list of users
 * restriction: 'admin'
 */
export const index = (req, res) => {
  UserModel.find({}, '-salt -hashedPassword', (err, users: IUser[]) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

export const getRumors = (req, res) => {
  UserModel.findById(req.params.id, (err, user: IUser) => {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(404).send("Unable to get user");
    return res.status(200).json(user.rumors)
  });
};

export const resolveWant = (userId, want) => {
  return Q.Promise((resolve, reject) => {
    UserModel.findById(userId, (err, userWithWant: IUser) => {
      if (err) return reject({status: 500, message: err});
      if (!userWithWant) return reject({status: 404, message: "Unable to get user"});
      UserModel.find({nodeEndpoint: want.EndPoint}, (err, userWithRumor: IUser) => {
        if (err) return reject(err)
        if (!userWithRumor) return reject({status: 200, data: "User is not found"})
        if (!userWithRumor.rumors) userWithRumor.rumors = []
        let rumorsToAdd = userWithRumor.rumors
        .filter((rumor) => {
          let uuids = Object.keys(want.Want);
          let messageIdParts = rumor.Rumor.messageID.split(":");
          let rumorUuid = messageIdParts[0];
          let rumorSequence = messageIdParts[1];
          return rumorSequence > want.Want[rumorUuid];
        });
        userWithWant.rumors = userWithWant.rumors.concat(rumorsToAdd);
        userWithWant.save((err) => {
          if (err) return reject(err);
          return resolve(rumorsToAdd)
        })
      })
    });
  });
};

export const createRumorFromRumor = (userId, rumor) => {
  return Q.Promise((resolve, reject) => {
    console.log("CREATING RUMOR FROM RUMOR");
    console.log(userId);
    console.log(rumor);
    console.log(rumor.Rumor.Text)
    UserModel.findById(userId, (err, user) => {
      if (err) {
        console.error(err)
        return reject({status: 500, message: err});
      }
      if (!user) return reject({status: 404, message: "Unable to get user"})
      let exists = user.rumors.filter((eaRumor) => {
          return eaRumor.Rumor.messageID == rumor.Rumor.messageID
        }).length > 0;
      console.log("Exists? " + exists)
      if (!exists) {
        user.rumors.push(rumor);
        user.save((err) => {
          if (err) return reject({status: 500, message: err});
          return resolve(rumor)
        })
      } else {
        return resolve(rumor)
      }
    });
  });
};

export const createRumorFromMessage = (userId, message) => {
  return Q.Promise((resolve, reject) => {
    UserModel.findById(userId, (err, user) => {
      if (err) return reject({status: 500, message: err});
      if (!user) return reject({status: 404, message: "Unable to get user"});
      let text = message;
      let originator = user.username;
      let maxSequenceNum = this.maxSequenceNumber(user.rumors, user.uuid);
      let messageId = user.uuid + ":" + (maxSequenceNum + 1);
      let rumor = {
        Rumor: {
          messageID: messageId,
          Originator: originator,
          Text: text
        },
        EndPoint: user.nodeEndpoint
      };
      user.rumors.push(rumor);
      user.save((err) => {
        if (err) return reject({status: 500, message: err});
        return resolve(rumor)
      });
    });
  })
};

export const resolveRumor = (userId, rumor) => {
  return Q.Promise((resolve, reject) => {
    let resultPromise = null;
    console.log("Resolving rumor")
    console.log(rumor.EndPoint)
    UserModel.findOne({nodeEndpoint: rumor.EndPoint}, (err, user) => {
      if (err) {
        console.log(err)
        return reject({status: 500, message: err});
      }
      if (!user) {
        console.log("There is no user, creating new User...")
        let newUser = new UserModel({
          name: rumor.Rumor.Originator,
          username: rumor.Rumor.Originator,
          seed: true,
          rumors: [rumor],
          nodeEndpoint: rumor.EndPoint,
          neighbors: [],
          uuid: rumor.Rumor.messageID.split(":")[0]
        });
        console.log("Saving user")
        console.log(newUser)
        resultPromise = this.saveUser(newUser);
      } else {
        console.log("There is a user")
        resultPromise = this.createRumorFromRumor(userId, rumor);
      }
      resultPromise
      .then(resolve)
      .catch(reject)
    });
  });
}

export const createRumorReq = (req, res) => {
  //if the message coming in is a rumor do something
  console.log("======================== CREATE RUMOR REQ =========================");
  let rumor = req.body.Rumor;
  let want = req.body.Want;
  let userId = req.params.id;
  console.log("Getting user from id: " + userId);
  let resultPromise = null;
  if (rumor) {
    console.log("Creating rumor ")
    console.log(rumor.Rumor)
    if (!userId) {
      console.log("No user, creating user then rumor...")
      resultPromise = this.resolveRumorWithNoUser(rumor)
    } else {
      console.log("User exists, update user with new rumor")
      resultPromise = this.resolveRumor(userId, rumor)
    }
  } else if (want) {
    console.log(want)
    resultPromise = this.resolveWant(userId, want);
  } else {
    console.log("Creating rumor...");
    console.log(req.body.message);
    resultPromise = this.createRumorFromMessage(userId, req.body.message);
  }

  resultPromise
  .then((result) => {
    res.status(200).json(result)
  })
  .catch((err) => {
    res.status(500).json(err)
  })
};

export const resolveRumorWithNoUser = (rumor) => {
  return this.createAnonymous(rumor.Rumor.Originator, rumor.EndPoint)
  .then((newUser) => {
    return this.resolveRumor(newUser._id, rumor)
  })
}

export const checkins = (req, res) => {
  let token = req.query.token;
  let username = req.query.username;
  if (!token) {
    return res.json({error: "No token found"});
  }
  let options = {
    hostname: 'api.foursquare.com',
    path: '/v2/users/self/checkins',
    method: 'GET',
    oauth_token: token
  };
  let URI = 'https://api.foursquare.com/v2/users/self/checkins';
  let query = "?oauth_token=" + token + '&v=20170214';
  let completeURI = URI + query;
  this.getCheckins(completeURI, req.param("id")).then((data) => {
    console.log(data);
    res.status(200).json(data)
  }).catch((err) => {
    return res.status(500).json({error: err})
  })
};

export const getCheckins = (url, id) => {
  console.log(url);
  return Q.Promise((resolve, reject) => {
    let body: any = '';
    let json: any = '';
    https.get(url, (resp) => {
      resp.on("data", (chunk) => {
        body += chunk;
      });
      resp.on('end', () => {
        json = JSON.parse(body);
        let checkins = json.response.checkins;
        console.log(json);
        console.log(checkins);
        UserModel.findById(id, (err, user) => {
          if (err) return reject({status: 500, error: err});
          user.checkins = checkins;
          resolve({user: user, checkins: checkins, json: json});
        })
      });

      resp.on("error", (err) => {
        reject({status: 500, message: err})
      })
    })
  });
}

export const addNeighborAndSave = (newUser) => {
  console.log("Adding neighbor and saving");
  return Q.Promise((resolve, reject) => {
    if (newUser.seed) {
      // Put all the other seeds as its neighbors and give me to them as a neighbor
      UserModel.find({seed: true}, (err, users) => {
        if (err) {
          console.error(err)
          return reject({status: 500, message: err});
        }
        if (!users) return reject({status: 404, err: "Unable to get users."});

        let operations = [];
        users.forEach((user) => {
          if (newUser._id != user._id) {
            if (user.neighbors.indexOf(newUser._id) == -1) {
              user.neighbors.push(newUser._id);
              operations.push(this.saveUser(user))
            }
            if (newUser.neighbors.indexOf(user._id) == -1) {
              //user not in neighbors
              newUser.neighbors.push(user._id);
              operations.push(this.saveUser(newUser))
            }
          }
        });

        Q.all(operations)
        .then((results) => {
          console.log(results);
          return resolve(results);
        })
        .catch((err) => {
          console.error(err);
          return reject({status: 500, err: err});
        })
      })
    } else {
      console.log("Not a seed");
      UserModel.find({seed: true}, (err, users) => {
        if (err) return reject({status: 500, err: err});
        if (!users) return reject({status: 404, err: "Unable to get users."})

        // Add one of the seeds as its neighbor
        if (users.length > 0) {
          let index = Utils.getRandom(0, users.length);
          let user = users[index];
          console.log(index);
          console.log(users);
          newUser.neighbors.push(user._id);
          // The seed user will have this new user as a neighbor
          user.neighbors.push(newUser._id);

          Q.all([
            this.saveUser(newUser),
            this.saveUser(user)
          ])
          .then((results) => {
            console.log(results);
            return resolve(users);
          })
          .catch((err) => {
            console.log(err);
            return reject({status: 500, err: err});
          })
        } else {
          console.log("no seeds, default to seed");
          //if there are no seeds yet, default this guy to seed.
          newUser.seed = true;

          this.saveUser(newUser)
          .then((user) => {
            return resolve(user);
          })
          .catch((err) => {
            console.log(err);
            return reject({status: 500, err: err});
          })
        }
      })
    }
  })
}

/**
 * Creates a new user
 */
export const createAnonymous = (originator, endpoint) => {
  return Q.Promise((resolve, reject) => {
    let newUser = null;
    if (originator && endpoint) {
      newUser = new UserModel({
        nodeEndpoint: endpoint,
        username: originator,
        name: originator,
        role: 'user',
        provider: 'anonymous'
      });
    }
    newUser.uuid = uuid.v4();
    newUser.seed = Utils.getRandom(0, 5) % 3 === 0;
    UserModel.find({username: originator, provider: "anonymous"}, (err, users) => {
      if (!err && users && users.length > 0) {
        console.log("Found node endpoint with username. Don't need to add user.")
        console.log(users)
        const token = jwt.sign({_id: users[0]._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
        return resolve({token: token});
      } else {
        this.addNeighborAndSave(newUser)
        .then((results) => {
          console.log("Neighbors added...")
          console.log(results);
          const token = jwt.sign({_id: newUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
          console.log(token);
          return resolve({token: token});
        })
        .catch((errResult) => {
          return reject(errResult.err);
        })
      }
    })
  })
};

/**
 * Creates a new user
 */
export const create = (req, res, next) => {
  let originator = req.body.originator;
  let endpoint = req.body.endpoint;
  let newUser = null;
  if (originator && endpoint) {
    newUser = new UserModel({
      nodeEndpoint: endpoint,
      username: originator,
      name: originator,
      role: 'user',
      provider: 'anonymous'
    });
  } else {
    newUser = new UserModel(req.body);
    newUser.nodeEndpoint = "https://www.danielmhair.com/api/users/" + newUser._id + "/rumors";
    newUser.role = 'user';
    newUser.provider = 'local';
  }
  newUser.uuid = uuid.v4();
  newUser.seed = Utils.getRandom(0, 5) % 3 === 0;
  if (newUser.provider === "anonymous") {
    UserModel.find({username: originator, provider: "anonymous"}, (err, users) => {
      if (!err && users && users.length > 0) {
        console.log("Found node endpoint with username. Don't need to add user.")
        console.log(users)
        let token = jwt.sign({_id: users[0]._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
        return res.status(200).json({token: token});
      } else {
        this.addNeighborAndSave(newUser)
        .then((results) => {
          console.log("Neighbors added...")
          console.log(results);
          let token = jwt.sign({_id: newUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
          console.log(token);
          return res.status(200).json({token: token});
        })
        .catch((errResult) => {
          return res.status(errResult.status).json(errResult.err);
        })
      }
    })
  } else {
    this.addNeighborAndSave(newUser)
    .then((results) => {
      console.log("Neighbors added...")
      console.log(results);
      let token = jwt.sign({_id: newUser._id}, ServerSettings.secrets.session, {expiresIn: 60 * 5});
      console.log(token);
      return res.status(200).json({token: token});
    })
    .catch((errResult) => {
      return res.status(errResult.status).json(errResult.err);
    })
  }
};

/**
 * Get a single user
 */
export const show = (req, res, next) => {
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
export const destroy = (req, res) => {
  UserModel.findByIdAndRemove(req.params.id, (err, user) => {
    if (err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
export const changePassword = (req, res, next) => {
  let userId = req.user._id;
  let oldPass = String(req.body.oldPassword);
  let newPass = String(req.body.newPassword);

  UserModel.findById(userId, (err, user) => {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save((err) => {
        if (err) return this.validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Get my info
 */
export const me = (req, res, next) => {
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
export const authCallback = (req, res, next) => {
  res.redirect('/');
};

export const propagateRumors = () => {
  UserModel.find({}, (err, users) => {
    console.log(users)
    users.forEach((user) => {
      console.log("============")
      console.log(user.username)
      console.log(user.nodeEndpoint)
      if (user.neighbors.length > 0 && user.rumors.length > 0) {
        let randomNeighborId = user.neighbors[Utils.getRandom(0, user.neighbors.length)];
        const neighborUsers = users.filter((neighbor) => {
          if (neighbor._id == randomNeighborId) {
            console.log("neighbor id is randomNeighbor")
            return true
          }
          return false
        });
        console.log(neighborUsers)
        if (neighborUsers.length == 0) {
          console.log("I don't what happened....");
        }
        let neighborUser = neighborUsers[0]
        console.log(randomNeighborId)
        if (Utils.getRandom(0, 2) == 0) {
          // Prepare a rumor
          let randomRumor = user.rumors[Utils.getRandom(0, user.rumors.length)];
          // this.createRumorFromRumor(randomNeighborId, randomRumor)
          console.log("Sending random rumor...")
          console.log(randomRumor)
          this.httpPost(neighborUser.nodeEndpoint, {"Rumor": randomRumor})
          .then((response) => {
            console.log(response)
          })
          .catch((err) => {
            console.error(err)
          })
        } else {
          // Prepare a want
          const Want = this.prepareWant(user);
          // this.resolveWant(randomNeighborId, Want)
          console.log("Sending random want...")
          console.log(neighborUser)
          this.httpPost(neighborUser.nodeEndpoint, {"Want": Want})
          .then((response) => {
            console.log(response)
          })
          .catch((err) => {
            console.error(err)
          })
        }
      }
    })
  })
};

export const prepareWant = (user) => {
  let Want = {
    "Want": {},
    "EndPoint": user.nodeEndpoint
  };

  Utils.uniqueItems(
    user.rumors.map((rumor) => {
      return parseInt(rumor.Rumor.messageID.split(":")[0])
    })
  ).forEach((uuid) => {
    Want.Want[uuid] = this.maxSequenceNumber(user.rumors, uuid);
  });

  return Want;
}

export const saveUser = (user) => {
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

export const maxSequenceNumber = (rumors, uuid) => {
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


export const httpPost = (url, body) => {
  return Q.Promise((resolve, reject) => {
    if (!url) return reject("No url");
    console.log(url)
    request({
      url: url,
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      },
      rejectUnauthorized: false
    }, (error, response, body) => {
      if (error) return reject(error);
      return resolve({status: response.status, data: body})
    });
  })
}

export const validationError = (res, err) => {
  return res.status(422).json(err);
};
