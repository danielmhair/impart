import {BaseDocument} from "../../../server/models/BaseDocument";

export interface IActivity extends BaseDocument {
  name: string;
  description: string;
  originalUser: string;
  address: Address;
  categories: string[];
  event: any;
}

export class Activity implements IActivity {
  _id : string;
  name: string = "";
  description: string = "";
  originalUser: string = "";
  address: Address = {};
  categories: string[];
  event: any = {};

  constructor(name: string, description: string, address: Address, originalUser: string,
              categories: string[], event: any) {
    this.name = name;
    this.description = description;
    this.address = address;
    this.categories = categories;
    this.event = event;
  }
}

export interface Address {
  city?: string,
  street?: string,
  zip?: string
}
