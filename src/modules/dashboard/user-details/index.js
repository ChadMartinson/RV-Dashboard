import angular from 'angular';
import uirouter from 'angular-ui-router';

import routes from './userDetails.routes';
import UserDetailsController from './user_details.controller';
import UserSvc from '../../../services/users.service';


export default angular.module('myApp.userDetails', [uirouter, UserSvc])
  .config(routes)
  .controller('UserDetailsController', UserDetailsController)
  .name;
