export default function routes ($stateProvider) {
  $stateProvider
    .state('users', {
      url: '/users',
      views: {
        'content': {
          templateUrl: 'modules/users/users.html',
          controller: 'UsersController',
          controllerAs: 'u'
        },
        'headerbar@': {
          templateUrl: 'modules/header/rvHeaderbar.html'
        }
      }

    });
}
