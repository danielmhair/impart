import * as _ from 'lodash';
import { UserFollowerModel, IUserFollower } from './user-follower.model';

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
    if (req.body._id == null) delete req.body._id;
    UserFollowerModel.create(req.body, function(err, document: IUserFollower) {
      if(err) { return UserFollowerCtrl.handleError(res, err); }
      return res.status(201).json(document);
    });
  }

  // Updates an existing state in the DB.
  public static update(req, res) {
    if(req.body._id) { delete req.body._id; }
    UserFollowerModel.findById(req.params.id, function (err, document: IUserFollower) {
      if (err) { return UserFollowerCtrl.handleError(res, err); }
      if(!document) { return res.status(404).send('Not Found'); }
      var updated = _.merge(document, req.body);
      updated.save(function (err) {
        if (err) { return UserFollowerCtrl.handleError(res, err); }
        return res.status(200).json(document);
      });
    });
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