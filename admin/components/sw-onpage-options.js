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

          var appDisplay = staticWeb.config.onPage.display;
          var userDisplay = staticWeb.getUserSetting('sw.config.onPage.display');

          staticWeb.insertTemplate(tmp, element);

          var optionsCheckbox = element.querySelector('#sw-panel-left-checkbox');
          var optionsLabel = element.querySelector('.sw-panel-dragdown label');
          if (appDisplay == 'always' || userDisplay == 'always') {
            optionsCheckbox.checked = true;
          }

          optionsCheckbox.addEventListener('change', function (e) {
            var value = optionsCheckbox.checked ? 'always' : 'onDemand';
            staticWeb.setSetting('sw.config.onPage.display', value);
            return;
          });
          
          staticWeb.loadComponents();
        }
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
