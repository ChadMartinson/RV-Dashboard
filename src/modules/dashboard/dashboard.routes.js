export default function routes ($stateProvider) {
  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      views: {
        'content': {
          templateUrl: 'modules/dashboard/dashboard.html',
          controller: 'DashboardController',
          controllerAs: 'd',
          // This is for eventually adding breadcrumbs to the header directive!
          data: {
            page: "Dashboard",
            breadcrumb: "Home / Dashboard"
          }
        },
        'headerbar@': {
          templateUrl: 'modules/header/rvHeaderbar.html'
        }
      }

    })
    .state('dashboard.userDetail', {
      url: '/user/{id:[0-9]{1,4}}',
      controller: ['$scope', '$stateParams', 'user', 'UserSvc',
                function ($scope, $stateParams, user,  UserSvc) {
                  $scope.user = 'Chad';
                }],
      views: {
        'hello': {
          template: '{{details.user}}'
        }
      }
    });
}
