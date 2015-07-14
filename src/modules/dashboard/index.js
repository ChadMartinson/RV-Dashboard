import angular from 'angular';
import uirouter from 'angular-ui-router';

import routes from './dashboard.routes';
import DashboardController from './dashboard.controller';
import UserSvc from '../../services/users.service';
import WidgetSvc from '../../services/widgets.service';


export default angular.module('myApp.dashboard', [uirouter, UserSvc, WidgetSvc])
  .config(routes)
  .controller('DashboardController', DashboardController)
  .name;
