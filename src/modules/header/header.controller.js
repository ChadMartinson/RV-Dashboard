import angular from 'angular';

export default class HeaderController {
  constructor($scope, $state) {
    $scope.current = $state.current;
    //console.log($scope.current); //So far this returns as empty
  }
}
