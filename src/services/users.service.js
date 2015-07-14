import angular from 'angular';

class UserSvc {
  constructor($http) {
    this.http = $http;
    this.url = 'http://spa.tglrw.com:4000';
  }

  getUsers() {
    return this.http.get(this.url + '/users').then(res => res.data);
  }

  getUserDetails(id) {
    return this.http.get(this.url + '/users/' + id).then(res => res.data);
  }
}

export default angular.module('services.users', [])
  .service('UserSvc', UserSvc)
  .name;
