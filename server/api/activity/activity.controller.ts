import * as _ from 'lodash';
import { Activity, IActivity } from './activity.model';

export class ActivityCtrl {
  // Get list of clients
  public static index(req, res) {
    Activity.find({}, function(err, documents: IActivity[]) {
      if(err) { return ActivityCtrl.handleError(res, err); }
      return res.status(200).json(documents);
    });
  }

  // Creates a new state in the DB.
  public static create(req, res) {
    if (req.body._id == null) delete req.body._id;
    Activity.create(req.body, function(err, document: IActivity) {
      if(err) { return ActivityCtrl.handleError(res, err); }
      return res.status(201).json(document);
    });
  }

  // Updates an existing state in the DB.
  public static update(req, res) {
    if(req.body._id) { delete req.body._id; }
    Activity.findById(req.params.id, function (err, document: IActivity) {
      if (err) { return ActivityCtrl.handleError(res, err); }
      if(!document) { return res.status(404).send('Not Found'); }
      var updated = _.merge(document, req.body);
      updated.save(function (err) {
        if (err) { return ActivityCtrl.handleError(res, err); }
        return res.status(200).json(document);
      });
    });
  }

  // Deletes a state from the DB.
  public static destroy(req, res) {
    Activity.find({ _id: req.params.id }).remove(function(err) {
      if(err) { return ActivityCtrl.handleError(res, err); }
      return res.status(204).send('No Content');
    });
  }

  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
}