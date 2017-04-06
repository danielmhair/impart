/// <reference path="typings.d.ts" />
"use strict";

// Libraries
import * as bodyParser from "body-parser";
import * as express from "express";
import * as helmet from 'helmet';
import * as path from 'path';
import * as cors from 'cors'
import * as requestLogger from 'morgan';
import * as logger from 'winston';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as ejs from 'ejs'
import { connection } from 'mongoose';
import * as compression from 'compression';
import * as methodOverride from 'method-override';
import * as cookieParser from 'cookie-parser';
import * as errorHandler from 'errorhandler';
import * as passport from 'passport';
import * as session from 'express-session';
import * as connectMongo from 'connect-mongo'
import * as connectLiveReload from 'connect-livereload';
import * as favicon from 'serve-favicon';

const mongoStore = connectMongo(session);

// Your own modules
import { DatabaseSettings } from './DatabaseSettings';
import { MongoManager } from './MongoManager';
import { ServerSettings } from './config/environment';
import { UserApi } from './api/user';
import { AuthApi } from './auth';

/**
 * The server for Node
 *
 * @class Server
 */
export class Server {

  public app: express.Application;
  public httpPort: number;
  public httpsPort: number;

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor(httpPort?: number, httpsPort?: number) {
    this.httpPort = httpPort;
    this.httpsPort = httpsPort;

    // Create the Express Application
    this.app = express();

    // Set environment to development as default
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    // Security for Express
    this.app.use(helmet());

    // Helps url encoded requests (content-type = url-encoded)
    this.app.use(bodyParser.urlencoded({ extended: false }));

    // Helps json requests (content-type = json)
    this.app.use(bodyParser.json());
    this.app.use(bodyParser({ keepExtensions: true}));

    this.app.use(compression());
    this.app.use(methodOverride());
    this.app.use(cookieParser());

    // Typescript for morgan (requestLogger) doesn't allow the string templates like 'dev' so ignore typescript this time
    // Adds logging to any request coming in, for express
    //noinspection TypeScriptValidateTypes
    this.app.use(requestLogger('dev'));

    // Enable CORS on all requests
    this.app.use(cors());

    // Creates the routes for our server
    this.initPassport();
    this.initRoutes();

    if (DatabaseSettings.useMongo) {
      let mongoManager = new MongoManager(`${__dirname}/seeds`);
      mongoManager.initAndConnectToMongo();
      // if(ServerSettings.seedDB) { require('./config/seed'); }
    }

    const options = {
      host: ServerSettings.ip,
      key: fs.readFileSync('ssl/server.key'),
      cert: fs.readFileSync('ssl/server.crt')
    };

    if (this.httpPort) {
      http.createServer(this.app).listen(httpPort, err => {
        if (err) {
          logger.error(err);
          return;
        }
        logger.info(`Listening on port ${httpPort}`);
      });
    }

    if (this.httpsPort) {
      https.createServer(options, this.app).listen(httpsPort, err => {
        if (err) {
          logger.error(err);
          return;
        }
        logger.info(`Listening on port ${httpsPort}`);
      });
    }
  }

  public initPassport(): void {
    this.app.use(passport.initialize());

    // Persist sessions with mongoStore
    // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
    this.app.use(session({
      secret: ServerSettings.secrets.session,
      resave: true,
      saveUninitialized: true,
      store: new mongoStore({
        mongooseConnection: connection,
        db: 'foursquare-integration'
      })
    }));
  }

  /**
   * Initializes all the routes for the server
   */
  public initRoutes(): void {
    // this.app.use('/app', express.static(path.join(__dirname, '../dist')));
    this.app.set("view options", {layout: false});
    this.app.engine('html', ejs.renderFile);
    this.app.set('view engine', 'html');
    this.app.use(express.static('../app/build'));

    const env = this.app.get('env');
    this.app.use(favicon(path.join(ServerSettings.root, 'apps', 'home', 'favicon.ico')));

    this.app.use('/api/users', UserApi);
    this.app.use('/auth', AuthApi);

    this.app.route('/:url(node_modules|assets|server|src)/*')
    .get(Server.PageNotFound404);
  }

  public static PageNotFound404(req, res, next) {
    return res.send('<h1>404 Not Found</h1>');
  }
}

exports = new Server(null, 3008).app;