export default class UserDetailsController {
  constructor (UserSvc, $stateParams) {
    this.userSvc = UserSvc;

  }
}

UserDetailsController.$inject = ['UserSvc', '$stateParams'];
