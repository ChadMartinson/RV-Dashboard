import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './userDetails.routes';
import UserSvc from '../../services/users.service';

export default angular.module('myApp.userDetails', [uirouter, UserSvc])
  .config(routing)
  .name;
