'use strict';

import * as path from 'path';

const domain = "https://www.danielmhair.com:3008";
// const domain = "http://localhost:3008";
export class ServerSettings {
  // Server port
  public static httpsPort: 3008;
  public static httpPort: 3008;
  // Server IP
  public static ip: '127.0.0.1';
  // public static ip: '0.0.0.0';

  public static root = path.normalize(__dirname + '/../..');
  public static appUrl: string = "http://localhost:4200";
  public static tokenAgeInMinutes = 60*5;



  // Should we populate the DB with sample data?
  public static seedDB: boolean = false;

  // Secret for session, you will want to change this and make it an environment variable
  public static secrets = {
    session: 'impart-secret'
  };

  // List of user roles
  public static userRoles = ['guest', 'user', 'admin'];

  // MongoDB connection options
  public static mongo = {
    options: {
      db: {
        safe: true
      }
    }
  };

  public static eventful = {
    applicationKey: '5JbTdSGnZvzCnWZk'
  }
  
  public static facebook = {
    clientID:     '470257669848563',
    clientSecret: 'a4278103b2da0dcd5c0c39dddc63b0d9',
    callbackURL:  domain + '/auth/facebook/callback'
  };
  
  public static twitter = {
    clientID:     '36LwYpi132fVTnyVnTCIEWMg1',
    clientSecret: '4w5KrYPx6UQyN08Jf6sJWVNGZbDlxqo367QSsSbFnkYWuIbmBy',
    callbackURL:  domain + '/auth/twitter/callback'
  };

  public static google = {
    clientID:     '241716334068-263eb40evdrd3la4h8ap89nr618tar7n.apps.googleusercontent.com',
    clientSecret: 'uc2VOBlb8Kyw3x2S_plqpYcw',
    callbackURL:  domain + '/auth/google/callback'
  };
  
  public static foursquare = {
    clientID:     'A3SKR3PONW1X5TZ30XXVL4IXW1O2MM0B2JDRMFMJSOV1YGTP',
    clientSecret: 'QV0TE0C55MGGNGWCBYFZX1WG3FYYUBZVBLZF5A5QL0KBVC3Y',
    callbackURL:  domain + '/auth/foursquare/callback'
  };
};
