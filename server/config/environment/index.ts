'use strict';

import * as path from 'path';

const domain = "https://www.danielmhair.com";

export class ServerSettings {
  public static env = process.env.NODE_ENV;
  public static root = path.normalize(__dirname + '/../../..');
  public static appUrl: string = "https://www.danielmhair.com/foursquare-integration/";
  public static tokenAgeInMinutes = 60*5;

  // Server port
  public static httpsPort: 443;
  public static httpPort: 80;
  
  // Server IP
  public static ip: '0.0.0.0';

  // Should we populate the DB with sample data?
  public static seedDB: boolean = false;

  // Secret for session, you will want to change this and make it an environment variable
  public static secrets = {
    session: 'upickit-secret'
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
  
  public static facebook = {
    clientID:     process.env.FACEBOOK_ID || '470257669848563',
    clientSecret: process.env.FACEBOOK_SECRET || 'a4278103b2da0dcd5c0c39dddc63b0d9',
    callbackURL:  domain + '/auth/facebook/callback'
  };
  
  public static twitter = {
    clientID:     process.env.TWITTER_ID || '36LwYpi132fVTnyVnTCIEWMg1',
    clientSecret: process.env.TWITTER_SECRET || '4w5KrYPx6UQyN08Jf6sJWVNGZbDlxqo367QSsSbFnkYWuIbmBy',
    callbackURL:  domain + '/auth/twitter/callback'
  };

  public static google = {
    clientID:     process.env.GOOGLE_ID || '3567147298-h3egd5uclcgrn18noun537qvvbd4lj7d.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'MOB6GXFU5VEZpne9_DggAlZF',
    callbackURL:  domain + '/auth/google/callback'
  };
  
  public static foursquare = {
    clientID:     process.env.FOURSQUARE_ID || 'A3SKR3PONW1X5TZ30XXVL4IXW1O2MM0B2JDRMFMJSOV1YGTP',
    clientSecret: process.env.FOURSQUARE_SECRET || 'QV0TE0C55MGGNGWCBYFZX1WG3FYYUBZVBLZF5A5QL0KBVC3Y',
    callbackURL:  domain + '/auth/foursquare/callback'
  };
};
