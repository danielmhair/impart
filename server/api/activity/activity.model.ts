import { Schema, model, Document } from 'mongoose';

export interface IActivity extends Document {
  name: string;
  description: string;
  address: { city: string, street: string, zip: string };
  categories: string[];
  event: Object;
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

export const Activity = model('Activity', ActivitySchema);
