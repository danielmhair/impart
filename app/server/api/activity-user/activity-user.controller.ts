import * as _ from 'lodash';
import * as Q from 'q';
import { ActivityUserModel, IActivityUser, IActivityUserModel, ActivityUser } from './activity-user.model';
import { ActivityUserOperations } from "../activity-user/activity-user.operations";
import { IActivityModel, ActivityModel, IActivity, Activity } from '../activity/activity.model';
import { ActivityOperations } from "../activity/activity.operations";
import { User, IUser } from "../user/user.model"
import { UserOperations } from "../user/user.operations"


export class ActivityUserCtrl {
  public static index(req, res) {
    ActivityUserModel.find({}, function(err, documents: IActivityUser[]) {
      if(err) { return ActivityUserCtrl.handleError(res, err); }
      return res.status(200).json(documents);
    });
  }

  // Creates a new state in the DB.
  public static create(req, res) {
    let userId = req.params.id;
    const activity: Activity = req.body;
    return Q.Promise((resolve, reject) => {
       UserOperations.getById(userId)
       .then((user: IUser) => { // <= Verify the user exists...
         if (!user) return reject({status: 404, message: "Unable to get user"});
         console.log(activity);
         //create the activity in the database
         ActivityModel.create(activity, (err, createdActivity: Activity) => {
           if (err) return reject({status: 500, err: err });
           console.log(createdActivity);
           //using the resulting document create the activity-user connection
           const activityUser: IActivityUser = new ActivityUser(createdActivity._id, userId, false);
           ActivityUserOperations.create(activityUser)
           .then((createdActivityUser: IActivityUserModel) => {
             console.log(createdActivityUser);
             return resolve({ activity: createdActivity, activityUser: createdActivityUser });
           })
           .catch((err) => reject({status: 500, err: err}));
         });
       })
       .catch((err) => reject({status: 500, err: err}));
    })
    .then((results) => {return res.status(200).json(results)})
    .catch((err) => {return res.status(500).json(err)})
  }

  // Updates an existing state in the DB.
  public static update(req, res) {
    ActivityUserModel.findById(req.params.id, function (err, document: IActivityUser) {
      if (err) { return ActivityUserCtrl.handleError(res, err); }
      if (!document) { return res.status(404).send('Not Found'); }
      var updated = _.merge(document, req.body);

      updated.save(function (err) {
        if (err) { return ActivityUserCtrl.handleError(res, err); }
        return res.status(200).json(document);
      });
    });
  }
  public static removeRecommendations() {
    ActivityUserOperations.destroyRecommendedTrue()
    .then((results) => "Successfully deleted all activity recommendations")
    .catch((err) => console.log(err))
  }
  // Deletes a state from the DB.
  public static destroy(req, res) {
    ActivityUserModel.find({ _id: req.params.id }).remove(function(err) {
      if(err) { return ActivityUserCtrl.handleError(res, err); }
      return res.status(204).send('No Content');
    });
  }

  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
}
