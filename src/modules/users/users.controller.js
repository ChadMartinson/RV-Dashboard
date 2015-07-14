export default class UsersController {
  constructor (UserSvc) {
    this.userSvc = UserSvc;
    this.init();
  }
  init() {
    this.userSvc.getUsers().then(users => {
      this.users = users;
    });
  }
}

UsersController.$inject = ['UserSvc'];
