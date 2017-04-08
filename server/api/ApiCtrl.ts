import { Model, Document } from 'mongoose';
import * as Q from 'q';
import * as _ from 'lodash';

export interface ApiModel<T extends Document> extends Model<T> {}

export class ApiCtrl<T extends Document> {
  protected Collection: ApiModel<T>;

  constructor(model: any) {
    this.Collection = model;
  }

  public getAll() {
    return Q.Promise((resolve, reject) => {
      this.Collection.find({}, function(err, documents: T[]) {
        if (err) return reject(err);
        return resolve(documents)
      });
    })
  }

  public getById(id: string) {
    return Q.Promise((resolve, reject) => {
      this.Collection.findById(id, function (err, document: T) {
        if (err) return reject(err);
        return resolve(document)
      });
    })
  }

  // Creates a new state in the DB.
  public create(activityUser: T) {
    return Q.Promise((resolve, reject) => {
      this.Collection.create(activityUser, function (err, document: T) {
        if (err) return reject(err);
        return resolve(document)
      });
    })
  }

  // Updates an existing state in the DB.
  public update(activityUser: T) {
    return Q.Promise((resolve, reject) => {
      this.Collection.findById(activityUser._id, function (err, document: T) {
        if (err) {
          return reject(err);
        }
        if (!document) {
          return reject('Not Found');
        }
        let updated = _.merge(document, activityUser);
        updated.save(function (err) {
          if (err) return reject(err);
          return resolve(updated)
        });
      });
    })
  }

  // // Deletes a state from the DB.
  public destroy(id: string) {
    return Q.Promise((resolve, reject) => {
      this.Collection.find({_id: id}).remove(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve("Deleted");
      });
    });
  }

  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
}