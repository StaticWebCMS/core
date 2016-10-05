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
          staticWeb.insertTemplate(template, elements[i]);
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
