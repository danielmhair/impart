'use strict';

import { Schema, model, Document } from 'mongoose';
import { pbkdf2Sync, randomBytes } from 'crypto';
const authTypes = ['github', 'twitter', 'facebook', 'google', 'foursquare', 'anonymous'];

export interface IRumor {
  messageID: string;
  Originator: string;
  Text: string;
}

export interface IRumorInfo {
  Rumor: IRumor;
  EndPoint: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: number;
  username: string;
  password: string;
  role: string;
  seed: boolean;
  rumors: IRumorInfo[];
  nodeEndpoint: string;
  neighbors: string[];
  uuid: String;
  permissions: string[];
  hashedPassword: string;
  provider: string;
  salt: string;
  facebook: Object;
  twitter: Object;
  google: Object;
  github: Object;
  foursquare: Object;
  authenticate: Function;
}

let UserSchema: Schema = new Schema({
  name: String,
  email: String,
  phone: Number,
  username: String,
  role: {
    type: String,
    default: 'user'
  },
  seed: { type: Boolean, default: false },
  nodeEndpoint: String,
  uuid: String,
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {},
  foursquare: {},
  categories: [],

  // TODO Both the the arrays below can be put into one other collection (userId:followerId)
  // To get people following you, search by { userId: userId }
  // To get people your following, search by { followerId: userId }
  // TODO Make activities a mongo document (we don't want an array for each user)
  activities: [],
  // TODO Remove properties below...
  neighbors: [String],
  permissions: [],
  rumors: [{
    Rumor: {
      messageID: String,
      Originator: String,
      Text: String
    },
    EndPoint: String
  }],
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
  if (!this.nodeEndpoint) {
    this.nodeEndpoint = "https://www.danielmhair.com/api/users/" + this._id + "/rumors";
  }
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

export const UserModel = model<IUser>('User', UserSchema);
