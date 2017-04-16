import {ServerSettings} from "./ServerSettings";
import { connection } from 'mongoose';
import * as connectMongo from 'connect-mongo'
import * as session from 'express-session';
const mongoStore = connectMongo(session);

const databaseName = "impart";
const databaseType = "mongodb";

export const DatabaseSettings = {
  useMongo: true,
  seedMongo: false,
  databaseName: databaseName,
  db: {
    seed: 'localhost/' + databaseName,
    uri: databaseType + '://localhost/' + databaseName,
    options: {
      db: {
        safe: true
      },
      config: {
        autoIndex: false
      }
    }
  },
  passport: {
    secret: ServerSettings.secrets.session,
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({
      mongooseConnection: connection,
      db: databaseName
    })
  }
};
