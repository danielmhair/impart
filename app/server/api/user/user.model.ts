'use strict';

import { Schema, model, Document, Types } from 'mongoose';
import { pbkdf2Sync, randomBytes } from 'crypto';
import {BaseDocument} from "../../models/BaseDocument";
const authTypes = ['github', 'twitter', 'facebook', 'google', 'foursquare', 'anonymous'];

export class User implements IUser {
  _id: string;
  name: string;
  email: string;
  phone: number;
  categories: string[];
  username: string;
  role: string;
  location: string;
  // nodeEndpoint: string;
  uuid: string;
  hashedPassword: string;
  provider: string;
  salt: string;
  facebook: Object;
  twitter: Object;
  google: Object;
  foursquare: Object;
  authenticate: Function;

  constructor(username: string, name: string, role?: string, location?: string) {
    this.name = name;
    this.username = username;
    this.role = "user";
    this.location = location;
  }
}

export interface IUserModel extends Document {
  name: string;
  email: string;
  phone: number;
  categories: string[];
  username: string;
  role: string;
  location: string;
  // nodeEndpoint: string;
  uuid: string;
  hashedPassword: string;
  provider: string;
  salt: string;
  facebook: Object;
  twitter: Object;
  google: Object;
  foursquare: Object;
  authenticate: Function;
}

export interface IUser extends BaseDocument {
  name: string;
  email: string;
  phone: number;
  categories: string[];
  username: string;
  role: string;
  location: string;
  // nodeEndpoint: string;
  uuid: string;
  hashedPassword: string;
  provider: string;
  salt: string;
  facebook: Object;
  twitter: Object;
  google: Object;
  foursquare: Object;
  authenticate: Function;
}

let UserSchema: Schema = new Schema({
  name: String,
  email: String,
  phone: Number,
  categories: [String],
  username: String,
  role: {
    type: String,
    default: 'user'
  },
  location: String,
  // nodeEndpoint: String,
  uuid: String,
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  foursquare: {},
});


UserSchema
.virtual('password')
.set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashedPassword = this.encryptPassword(password);
})
.get(function() {
  return this._password;
});

// Public profile information
UserSchema
.virtual('profile')
.get(function() {
  return {
    'name': this.name,
    'role': this.role
  };
});

// Non-sensitive info we'll be putting in the token
UserSchema
.virtual('token')
.get(function() {
  return {
    '_id': this._id,
    'role': this.role
  };
});

/**
 * Validations
 */

// Validate empty email
UserSchema
.path('email')
.validate(function(email) {
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return email.length;
}, 'Email cannot be blank');

// Validate empty password
UserSchema
.path('hashedPassword')
.validate(function(hashedPassword) {
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return hashedPassword.length;
}, 'Password cannot be blank');

// Validate email is not taken
UserSchema
.path('email')
.validate(function(value, respond) {
  var self = this;
  this.constructor.findOne({email: value}, function(err, user) {
    if(err) throw err;
    if(user) {
      if(self.id === user.id) return respond(true);
      return respond(false);
    }
    respond(true);
  });
}, 'The specified email address is already in use.');

/**
 * Pre-save hook
 */
UserSchema
.pre('save', function(next) {
  if (!this.isNew) return next();
  // if (!this.nodeEndpoint) {
  //   this.nodeEndpoint = "https://www.danielmhair.com/api/users/" + this._id + "/suggestions";
  // }
  next()
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return pbkdf2Sync(password, salt, 10000, 64, 'base64').toString('base64');
  }
};

export const UserModel = model<IUserModel>('UserSchema', UserSchema);
