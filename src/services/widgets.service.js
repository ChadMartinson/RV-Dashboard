import angular from 'angular';

class WidgetSvc {
  constructor($http) {
    this.http = $http;
    this.url = 'http://spa.tglrw.com:4000';
  }

  getWidgets() {
    return this.http.get(this.url + '/widgets').then(res => res.data);
  }

  getWidgetDetails() {
    return this.http.get(this.url + '/widgets/:id').then(res => res.data);
  }

  addWidget(newWidget) {
    return this.http.post(this.url + '/widgets', newWidget);
  }

  editWidget(widgetId, editedWidget) {
    return this.http.put(this.url + '/widgets/' + widgetId, editWidget);
  }
}

export default angular.module('services.widgets', [])
  .service('WidgetSvc', WidgetSvc)
  .name;
