'use strict';

import { Thing } from '../api/thing/thing.model';
import { User } from '../api/user/user.model';
import { ServerSettings } from './environment';

User.find({}).remove(() => {});
Thing.find({}).remove(() => {});