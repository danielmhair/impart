import { HttpRequest } from "../http-request";
import { ServerSettings } from "../../config/ServerSettings"
import {EventfulEvent, EventfulEventParams, EventfulEventResult } from "../../models/Eventful";
import {Utils} from "../../utils";

export class EventfulCategory {
  id: string;
  event_count: number;
  name: string;
}

export class Eventful {
  public static getCategories() {
    return HttpRequest.get(`http://api.eventful.com/json/categories/list?app_key=${ServerSettings.eventful.applicationKey}`);
  }

  public static getEvents(params: EventfulEventParams) {
    const url = Eventful.urlPath("events/search", params);
    return HttpRequest.get(url)
  }

  public static urlPath(path: string, params: EventfulEventParams) {
    return `http://api.eventful.com/json/${path}`
            + `?app_key=${ServerSettings.eventful.applicationKey}`
            + `&${Object.keys(params).map(k => `${k}=${params[k]}`).join("&")}`
  }
}

export class EventfulCtrl {
  public static handleError(res, err) {
    console.error(err);
    return res.status(500).send({ error: err });
  }

  public static getCategories(req, res) {
    console.log("Getting categories");
    Eventful.getCategories()
    .then((response: {status: number, data: any, response: any}) => {
      try {
        const data = JSON.parse(response.data);
        data.category = data.category.map(category => {
          category.name = Utils.escapeHTML(category.name);
          return category;
        });
        return res.status(response.status).json(data.category)
      }
      catch(e) {
        console.error("Unable to parse as json");
        return res.status(200).json(response.data);
      }
    })
    .catch(err => res.status(500).json(err))
  }

  public static getEvents(req, res) {
    const acceptedParams = ['keywords', 'location', 'category', 'date'];
    const isBadRequest = Object.keys(req.params).filter(param => acceptedParams.indexOf(param) >= 0).length == 0;
    if (Object.keys(req.params).length == 0 || isBadRequest) {
      return res.status(400).send("Bad request: Either the 'keywords', 'location', 'category' or 'date' parameters are required.")
    }
    Eventful.getEvents(req.params)
    .then((response: {status: number, data: any, response: any}) => res.status(response.status).json(response.data))
    .catch(err => res.status(500).json(err));
  }
}