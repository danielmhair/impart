import * as _ from 'lodash';
import { HttpRequest } from "../http-request";
import { ServerSettings } from "../../config/environment"

export class EventfulCategory {
  id: string;
  event_count: number;
  name: string;
}

export class EventfulCtrl {
  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }

  public static getCategories(req, res) {
    HttpRequest.get(`http://api.eventful.com/json/categories/list?app_key=${ServerSettings.eventful.applicationKey}`)
    .then(
      (categories: EventfulCategory[]) => {
        res.status(200).json(categories);
      },
      err => {
        console.error(err);
        res.status(400).send(err)
      }
    )
  })
  }

  // Get list of events for all users
  // public static index(req, res) {
  //   Collection.find({}, function(err, documents) {
  //     if(err) { return CollectionCtrl.handleError(res, err); }
  //     return res.status(200).json(documents);
  //   });
  // }

  // Create a new event to eventful
  // public static create(req, res) {
  //   if (req.body._id == null) delete req.body._id;
  //   Collection.create(req.body, function(err, collection) {
  //     if(err) { return CollectionCtrl.handleError(res, err); }
  //     return res.status(201).json(collection);
  //   });
  // }

  // Updates an existing event in eventful.
  // public static update(req, res) {
  //   if(req.body._id) { delete req.body._id; }
  //   Collection.findById(req.params.id, function (err, document) {
  //     if (err) { return CollectionCtrl.handleError(res, err); }
  //     if(!document) { return res.status(404).send('Not Found'); }
  //     var updated = _.merge(document, req.body);
  //     updated.save(function (err) {
  //       if (err) { return CollectionCtrl.handleError(res, err); }
  //       return res.status(200).json(document);
  //     });
  //   });
  // }

  // Deletes an event in eventful
  // public static destroy(req, res) {
  //   Collection.find({ _id: req.params.id }).remove(function(err) {
  //     if(err) { return CollectionCtrl.handleError(res, err); }
  //     return res.status(204).send('No Content');
  //   });
  // }
}