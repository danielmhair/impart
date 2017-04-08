import * as _ from 'lodash';
import { ActivityUser, IActivityUser } from './activity-user.model';

export class ActivityUserCtrl {
  public static index(req, res) {
    ActivityUser.find({}, function(err, documents: IActivityUser[]) {
      if(err) { return ActivityUserCtrl.handleError(res, err); }
      return res.status(200).json(documents);
    });
  }

  // Creates a new state in the DB.
  public static create(req, res) {
    if (req.body._id == null) delete req.body._id;
    ActivityUser.create(req.body, function(err, document: IActivityUser) {
      if(err) { return ActivityUserCtrl.handleError(res, err); }
      return res.status(201).json(document);
    });
  }

  // Updates an existing state in the DB.
  public static update(req, res) {
    if(req.body._id) { delete req.body._id; }
    ActivityUser.findById(req.params.id, function (err, document: IActivityUser) {
      if (err) { return ActivityUserCtrl.handleError(res, err); }
      if(!document) { return res.status(404).send('Not Found'); }
      var updated = _.merge(document, req.body);
      updated.save(function (err) {
        if (err) { return ActivityUserCtrl.handleError(res, err); }
        return res.status(200).json(document);
      });
    });
  }

  // Deletes a state from the DB.
  public static destroy(req, res) {
    ActivityUser.find({ _id: req.params.id }).remove(function(err) {
      if(err) { return ActivityUserCtrl.handleError(res, err); }
      return res.status(204).send('No Content');
    });
  }

  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
}