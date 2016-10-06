(function (staticWeb) {
  "use strict";
  var Options = function () {
    if (!(this instanceof Options)) {
      return new Options();
    }

    return this.init();
  }
  Options.prototype = {
    createInterface: function () {
      var self = this;
      var adminPath = staticWeb.getAdminPath();

      staticWeb.retrieveTemplate("sw-onpage-options", function (template) {
        var elements = staticWeb.elements["sw-onpage-options"].instances;
        for (var i = 0; i < elements.length; i++) {
          var element = elements[i];
          var tmp = template.cloneNode(true);

          staticWeb.insertTemplate(tmp, element);

          // Show/hide options menu and track when it changes
          self.trackOptionsOpenState(element);
          // Show/hide pages panel and track when it changes
          self.trackPanelPageOpenState(element);

          staticWeb.loadComponents();
        }
      });
    },
    trackPanelPageOpenState: function(element) {
      var appDisplay = staticWeb.config.onPage.navigation.display;
      var userDisplay = staticWeb.getUserSetting('sw.config.onPage.navigation.display');

      var checkbox = element.querySelector('#sw-panel-list-item-pages-checkbox');
      if (appDisplay == 'always' || userDisplay == 'always') {
        checkbox.checked = true;
      }

      checkbox.addEventListener('change', function (e) {
        var value = checkbox.checked ? 'always' : 'onDemand';
        staticWeb.setSetting('sw.config.onPage.navigation.display', value);
        return;
      });
    },
    trackOptionsOpenState: function (element) {
      var appDisplay = staticWeb.config.onPage.display;
      var userDisplay = staticWeb.getUserSetting('sw.config.onPage.display');

      var optionsCheckbox = element.querySelector('#sw-panel-left-checkbox');
      if (appDisplay == 'always' || userDisplay == 'always') {
        optionsCheckbox.checked = true;
      }

      optionsCheckbox.addEventListener('change', function (e) {
        var value = optionsCheckbox.checked ? 'always' : 'onDemand';
        staticWeb.setSetting('sw.config.onPage.display', value);
        return;
      });
    },
    onStorageReady: function (storage) {
      var self = this;
    },
    init: function () {
      var self = this;
      self.createInterface();
    }
  }
  staticWeb.components.swOnPageOptions = Options();
})(window.StaticWeb);
