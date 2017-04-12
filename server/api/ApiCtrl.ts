import { Model, Document } from 'mongoose';
import * as Q from 'q';
import * as _ from 'lodash';
import {BaseDocument} from "../models/BaseDocument";

export interface ApiModel<T extends Document> extends Model<T> {}
export class ApiCtrl<T extends Document, U extends BaseDocument> {
  protected Collection: ApiModel<T>;

  constructor(model: any) {
    this.Collection = model;
  }

  public getAll(): Q.Promise<T[]> {
    return Q.Promise<T[]>((resolve, reject) => {
      this.Collection.find({}, (err, documents: T[]) => {
        if (err) return reject(err);
        return resolve(documents)
      });
    })
  }

  public getById(id: string): Q.Promise<T> {
    return Q.Promise<T>((resolve, reject) => {
      this.Collection.findById(id, (err, document: T) => {
        if (err) return reject(err);
        return resolve(document)
      });
    })
  }

  public getBy(params: Object): Q.Promise<T[]> {
    return Q.Promise<T[]>((resolve, reject) => {
      this.Collection.find(params, function(err, documents: T[]) {
        if (err) return reject(err);
        return resolve(documents)
      });
    })
  }

  // Creates a new state in the DB.
  public create(activityUser: U): Q.Promise<T> {
    return Q.Promise<T>((resolve, reject) => {
      this.Collection.create(activityUser, (err, document: T) => {
        if (err) return reject(err);
        return resolve(document)
      });
    })
  }

  // Updates an existing state in the DB.
  public update(activityUser: U): Q.Promise<T> {
    return Q.Promise<T>((resolve, reject) => {
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
  public destroy(id: string): Q.Promise<String> {
    return Q.Promise<String>((resolve, reject) => {
      this.Collection.find({_id: id}).remove(function (err) {
        if (err) {
          return reject(err);
        }
        return resolve("Deleted");
      });
    });
  }
}