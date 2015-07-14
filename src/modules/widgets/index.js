import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './widgets.routes';
import WidgetsController from './widgets.controller';
import WidgetSvc from '../../services/widgets.service';

export default angular.module('myApp.widgets', [uirouter, WidgetSvc])
  .config(routing)
  .controller('WidgetsController', WidgetsController)
  .name;
