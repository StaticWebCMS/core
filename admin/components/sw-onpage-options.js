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

          staticWeb.retrieveTemplate("sw-panel-left", function(template) {
            var elements = staticWeb.elements["sw-onpage-options"].instances;
            for (var i = 0; i < elements.length; i++) {
              // clone template so we can do modifications to it
              var tmp = template.cloneNode(true);
              // create references to list and list item
              var list = tmp.querySelector('.sw-panel-content-list');
              var listItem = tmp.querySelector('.sw-panel-list-item');
              // clone list item to create pages panel
              var pages = listItem.cloneNode(true);
              self.createPagesPanel(pages);
              list.appendChild(pages);
              // remove dummy list item
              listItem.remove();
              // add our elements into our component(s) dom
              staticWeb.insertTemplate(tmp, elements[i]);
            }
          });
        },
        createPagesPanel: function(pagesElement) {
              var pagesTitle = pagesElement.querySelector('.sw-panel-list-item-title');
              pagesTitle.innerText = 'Pages';
              // change id and for attribute for pages panel
              var id = 'sw-panel-list-item-' + new Date().getTime();
              var checkbox = pagesElement.querySelector('.sw-panel-list-item-checkbox');
              checkbox.id = id;
              var label = pagesElement.querySelector('.sw-panel-list-item-header label');
              label.attributes["for"].value = id;
        },
        onStorageReady: function (storage) {
            var self = this;
            // if (staticWeb.isUserLevel('admin')) {
            //   var elements = staticWeb.elements.swlogin.instances;
            //   for (var i = 0; i < elements.length; i++) {
            //     elements[i].style.display = 'none';
            //   }
            // }
        },
        init: function () {
            var self = this;
            self.createInterface();
        }
    }
    staticWeb.components.swOnPageOptions = Options();
})(window.StaticWeb);
