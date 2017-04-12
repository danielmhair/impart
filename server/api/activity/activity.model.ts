import { Schema, model, Document } from 'mongoose';
import {BaseDocument} from "../../models/BaseDocument";

export interface Address {
  city?: string,
  street?: string,
  zip?: string
}


export interface IActivity extends BaseDocument {
  name?: string;
  description?: string;
  address?: Address;
  categories?: string[];
  event?: Object;
}

export class Activity extends BaseDocument {
  name: string = "";
  description: string = "";
  address: Address = {};
  categories: string[];
  event: Object = {};

  constructor(name: string, description: string, address: Address,
              categories: string[], event: Object, id?: string) {
    super(id);
    this.name = name;
    this.description = description;
    this.address = address;
    this.categories = categories;
    this.event = event;
  }
}

let ActivitySchema = new Schema({
  // _id is already included
  // userId: String, // This is a mongo id
  name: String,
  description: String,
  address: {
    city: String,
    street: String,
    zip: String,
  },
  categories: [String],
  event: {}
}, { collection: 'Activity' });

export interface IActivityModel extends Document {}
export const ActivityModel = model('Activity', ActivitySchema);
