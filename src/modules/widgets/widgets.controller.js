export default class WidgetsController {
  constructor (WidgetSvc) {
    this.widgetSvc = WidgetSvc;
    this.initWidgets();
    this.newWidget = {};
  }
  initWidgets() {
    this.widgetSvc.getWidgets().then(widgets => {
      this.widgets = widgets;
    });
  }
  createWidget() {
    this.newWidget.id = this.widgets.length + 1;
    this.widgetSvc.addWidget(this.newWidget);
    this.newWidget = {};
  }
  updateWidget() {
    // this.widgetId = $stateParams.id
    this.widgetSvs.editWidget(this.widget.id, this.newWidget);
    this.newWidget = {};
  }
}

// Using ng-annotate so $inject is not needed
// WidgetsController.$inject = ['WidgetSvc'];
