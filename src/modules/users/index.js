import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './users.routes';
import UsersController from './users.controller';
import UserSvc from '../../services/users.service';

export default angular.module('myApp.users', [uirouter, UserSvc])
  .config(routing)
  .controller('UsersController', UsersController)
  .name;
