import { Schema, model, Document } from 'mongoose';
import {BaseDocument} from "../../models/BaseDocument";

export interface Address {
  city?: string,
  street?: string,
  zip?: string
}


export interface IActivity extends BaseDocument {
  name: string;
  description: string;
  address: Address;
  categories: string[];
  event: any;
}

export class Activity implements IActivity {
  _id : string;
  name: string = "";
  description: string = "";
  address: Address = {};
  categories: string[];
  event: any = {};

  constructor(name: string, description: string, address: Address,
              categories: string[], event: any) {
    this.name = name;
    this.description = description;
    this.address = address;
    this.categories = categories;
    this.event = event;
  }
}

export interface IActivityModel extends Document {
  name: string;
  description: string;
  address: Address;
  categories: string[];
  event: any;
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

export const ActivityModel = model('Activity', ActivitySchema);
