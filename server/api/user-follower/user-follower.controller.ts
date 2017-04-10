import * as _ from 'lodash';
import { UserFollower, IUserFollower } from './user-follower.model';
import {UserFollowerOperations} from './user-follower.operations'

export class UserFollowerCtrl {
 
  // Get list of clients
  public static index(req, res) {
    UserFollower.find({}, function(err, documents: IUserFollower[]) {
      if(err) { return UserFollowerCtrl.handleError(res, err); }
      return res.status(200).json(documents);
    });
  }

  // Creates a new state in the DB.
  public static create(req, res) {
    if (req.body._id == null) delete req.body._id;
    if (req.body.followerId != null) return res.status(404).send('Bad Request: Need followerId')
    let relation ={"followerId": req.body.followerId, "userId": req.params.id}
    UserFollowerOperations.create(relation)
    .then((document: IUserFollower) => res.status(201).json(document))
    .catch(err => UserFollowerCtrl.handleError(res, err))
  }

  // Updates an existing state in the DB.
  public static update(req, res) {
    if(req.body._id) { delete req.body._id; }
    let relation ={"followerId": req.body.followerId, "userId": req.params.id}
    UserFollowerOperations.update(relation)
    .then((document: IUserFollower) => res.status(200).json(document))
    .catch(err => UserFollowerCtrl.handleError(res, err))
  }

  // Deletes a state from the DB.
  public static destroy(req, res) {
    UserFollower.find({ _id: req.params.id }).remove(function(err) {
      if(err) { return UserFollowerCtrl.handleError(res, err); }
      return res.status(204).send('No Content');
    });
  }

  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
}