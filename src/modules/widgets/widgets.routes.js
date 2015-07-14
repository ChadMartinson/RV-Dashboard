export default function routes ($stateProvider) {
  $stateProvider
    .state('widgets', {
      url: '/widgets',
      views: {
        'content': {
          templateUrl: 'modules/widgets/widgets.html',
          controller: 'WidgetsController',
          controllerAs: 'w'
        },
        'headerbar': {
          templateUrl: 'modules/header/rvHeaderbar.html'
        }
      }

    });
}
