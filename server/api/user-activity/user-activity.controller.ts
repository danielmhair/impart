import * as _ from 'lodash';
import { UserActivity } from './user-activity.model';

export class UserActivityCtrl {
  // Get list of clients
  public static index(req, res) {
    UserActivity.find({}, function(err, documents) {
      if(err) { return UserActivityCtrl.handleError(res, err); }
      return res.status(200).json(documents);
    });
  }

  // Creates a new state in the DB.
  public static create(req, res) {
    if (req.body._id == null) delete req.body._id;
    UserActivity.create(req.body, function(err, collection) {
      if(err) { return UserActivityCtrl.handleError(res, err); }
      return res.status(201).json(collection);
    });
  }

  // Updates an existing state in the DB.
  public static update(req, res) {
    if(req.body._id) { delete req.body._id; }
    UserActivity.findById(req.params.id, function (err, document) {
      if (err) { return UserActivityCtrl.handleError(res, err); }
      if(!document) { return res.status(404).send('Not Found'); }
      let updated = _.merge(document, req.body);
      updated.save(function (err) {
        if (err) { return UserActivityCtrl.handleError(res, err); }
        return res.status(200).json(document);
      });
    });
  }

  // Deletes a state from the DB.
  public static destroy(req, res) {
    UserActivity.find({ _id: req.params.id }).remove(function(err) {
      if(err) { return UserActivityCtrl.handleError(res, err); }
      return res.status(204).send('No Content');
    });
  }

  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
}