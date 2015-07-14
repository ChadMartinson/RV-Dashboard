export default class DashboardController {
  constructor(UserSvc, WidgetSvc) {
    this.userSvc = UserSvc;
    this.widgetSvc = WidgetSvc;
    this.initUsers();
    this.initWidgets();
  }
  initUsers() {
    this.userSvc.getUsers().then(users => {
      this.users = users;
    });
  }
  initWidgets() {
    this.widgetSvc.getWidgets().then(widgets => {
      this.widgets = widgets;
    });
  }
}

DashboardController.$inject = ['UserSvc', 'WidgetSvc'];
