import angular from 'angular';

function yesNo(input) {
  return input ? 'yes' : 'no';
}

export default angular.module('filters.yesNo', [])
  .filter('yesNo', yesNo)
  .name;
