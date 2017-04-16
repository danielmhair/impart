import * as _ from 'lodash';
import * as Q from 'q';
import {UserFollowerOperations} from './user-follower.operations'
import { IUserFollowerModel, UserFollowerModel, IUserFollower, UserFollower } from './user-follower.model';


export class UserFollowerCtrl {
  // Get list of clients
  public static index(req, res) {
    UserFollowerModel.find({}, function(err, documents: IUserFollower[]) {
      if(err) { return UserFollowerCtrl.handleError(res, err); }
      return res.status(200).json(documents);
    });
  }

  // Creates a new state in the DB.
  public static create(req, res) {
   //get the userId out of the params
   //get the followerId out of the body
   console.log("======================== CREATE RUMOR REQ =========================");
   let userId: string = req.params.id
   let followerId: string = req.body.followerId;

   return Q.Promise(async (resolve, reject) => {
   //get all the users followers.
    const Userfollowers: IUserFollowerModel[] = await UserFollowerOperations.getUserFollowersById(userId);
    console.log(Userfollowers)
    //check to see if the followerId exists in there.
    let exists = Userfollowers.filter(follower => {
      console.log(follower.followerId)
      console.log(followerId)
      return String(follower.followerId) == String(followerId)
    }).length > 0
    console.log(exists)
    if (exists) {
      //follower already exists, return 200
      reject("You are already following this User")
    } else {
      //create new follower
      const userFollower : IUserFollower = new UserFollower(followerId, userId)
      UserFollowerOperations.create(userFollower)
      .then((document: IUserFollowerModel) => resolve(document))
      .catch((err) => reject({status: 500, err: err}));
    }
  })
  .then((result) => {
      res.status(200).json(result)
    })
    .catch((err) => {
      console.log(err);
      res.status(200).json(err)
    })
  }

  // Updates an existing state in the DB.
  public static update(req, res) {
    if(req.body._id) { delete req.body._id; }
    const relation : IUserFollower = new UserFollower(req.body.followerId,req.params.id)
     UserFollowerOperations.update(relation)
     .then((document: IUserFollowerModel) => res.status(200).json(document))
     .catch(err => UserFollowerCtrl.handleError(res, err))
  }

  // Deletes a state from the DB.
  public static destroy(req, res) {
    UserFollowerModel.find({ _id: req.params.id }).remove(function(err) {
      if(err) { return UserFollowerCtrl.handleError(res, err); }
      return res.status(204).send('No Content');
    });
  }

  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
}