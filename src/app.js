import 'bootstrap/css/bootstrap.min.css!';
import 'font-awesome/css/font-awesome.min.css!';
import 'bower_components/rdash-ui/dist/css/rdash.min.css!';
import angular from 'angular';
import uirouter from 'angular-ui-router';
import routing from './app.config';

import rvNavbar from './directives/sidebar/navbar.directive';
import dashboard from './modules/dashboard/index';
import users from './modules/users/index';
import widgets from './modules/widgets/index';


angular.module('myApp', [uirouter, rvNavbar, dashboard, users, widgets])
  .run(['$rootScope', '$state', '$stateParams', function ($rootScope,   $state,   $stateParams) {

    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    }]
  )
  .config(routing);
