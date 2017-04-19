import * as _ from 'lodash';
import { ActivityModel, IActivity } from './activity.model';
import { ActivityUserOperations }  from '../activity-user/activity-user.operations'

export class ActivityCtrl {
  // Get list of clients
  public static index(req, res) {
    ActivityModel.find({}, function(err, documents: IActivity[]) {
      if(err) { return ActivityCtrl.handleError(res, err); }
      return res.status(200).json(documents);
    });
  }

  // Creates a new state in the DB.
  public static create(req, res) {
    if (req.body._id == null) delete req.body._id;
    console.log(req.body);
    ActivityModel.create(req.body, function(err, document: IActivity) {
      if(err) { return ActivityCtrl.handleError(res, err); }
      return res.status(201).json(document);
    });
  }

  public static getActivities = (req, res) => {
    let userId = req.params.id;
    ActivityUserOperations.getUsersActivities({userId: userId})
    .then((activities) => res.status(200).json(activities))
    .catch(err => res.status(500).json(err))
  };

  // Updates an existing state in the DB.
  public static update(req, res) {
    if(req.body._id) { delete req.body._id; }
    ActivityModel.findById(req.params.id, function (err, document: IActivity) {
      if (err) { return ActivityCtrl.handleError(res, err); }
      if(!document) { return res.status(404).send('Not Found'); }
      const updated = _.merge(document, req.body);
      updated.save(function (err) {
        if (err) { return ActivityCtrl.handleError(res, err); }
        return res.status(200).json(document);
      });
    });
  };

  // Deletes a state from the DB.
  public static destroy(req, res) {
    ActivityModel.find({ _id: req.params.id }).remove(function(err) {
      if(err) { return ActivityCtrl.handleError(res, err); }
      return res.status(204).send('No Content');
    });
  }

  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
}
