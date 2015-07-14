export default function routes ($stateProvider) {
  $stateProvider
    .state('user.detail', {
      parent: 'dashboard',
      url: '/users/:id',
      templateUrl: 'modules/userDetails/user.details.html',
      controller: function($scope, $stateParams) {
        $scope.id = $stateParams.id;
      }
    });
}
