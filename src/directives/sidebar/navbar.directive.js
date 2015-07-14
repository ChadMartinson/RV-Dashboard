import angular from 'angular';

function rvNavbar() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: "directives/sidebar/rvNavbar.html"
  }
}

export default angular.module('directives.rvNavbar', [])
  .directive('rvNavbar', rvNavbar)
  .name;
