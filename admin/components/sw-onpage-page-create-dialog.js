(function (staticWeb) {
  "use strict";
  var Dialog = function (element) {
    if (!(this instanceof Dialog)) {
      return new Dialog(element);
    }

    return this.init(element);
  }
  Dialog.prototype = {
    createInterface: function () {
      var self = this;
      var adminPath = staticWeb.getAdminPath();

      staticWeb.retrieveTemplate("sw-onpage-page-create-dialog", function (template) {
        var dialogTemplate = template.cloneNode(true);
        var dialog = dialogTemplate.cloneNode(true).querySelector('sw-dialog').children[0];
        var pathInput = dialog.querySelector('#sw-onpage-page-create-dialog-parent-url');

        var element = self._element;
        pathInput.innerText = element.getAttribute('data-staticweb-component-navnode-path');

        var templateItemTemplate = dialogTemplate.querySelector('sw-template-item').children[0];

        staticWeb.insertTemplate(dialog, element);

        var templateContainer = element.querySelector('.sw-onpage-page-create-dialog-content-templates');
        self._getTemplates(templateContainer, templateItemTemplate);

        var closeBtn = element.querySelector('.sw-onpage-dialog-close');
        closeBtn.addEventListener('click', function () {
          element.remove();
        });

      });
    },
    _getTemplates: function (templateContainer, templateItemTemplate) {
      var self = this;
      var adminPath = staticWeb.getAdminPath();

      staticWeb.storage.list(adminPath + 'config/layouts/page/', function (info, status) {
        var list = info;
        if (!list || list.length === 0) {
          templateContainer.innerHTML = '<span>No page layouts found. Please add page layouts to: ' + adminPath + 'config/layouts/page/</span>';
          return;
        }

        var list = arguments[0];
        var elements = [];
        templateContainer.innerHTML = '<b style="display:block;padding:5px;padding-bottom:10px;padding-top:30px">Choose page layout to use:</b>';

        for (var i = 0; i < list.length; i++) {
          var isPreview = list[i].path.indexOf('.jpg') > 0 || list[i].path.indexOf('.jpeg') > 0 || list[i].path.indexOf('.png') > 0 || list[i].path.indexOf('.gif') > 0;
          var isLayout = list[i].path.indexOf('.html') > 0 || list[i].path.indexOf('.htm') > 0;

          if (isLayout) {
            var name = list[i].name.replace('.html', '').replace('.htm', '');
            var path = list[i].path;
            var previewImagePath = list[i].path.replace('.html', '.jpg').replace('.html', '.jpg');

            var templateNode = templateItemTemplate.cloneNode(true);
            var radio = templateNode.querySelector('input[type=radio]');
            radio.setAttribute('id', 'sw-onpage-page-create-dialog-template-' + i);

            var label = templateNode.querySelector('label');
            label.setAttribute('for', 'sw-onpage-page-create-dialog-template-' + i);

            var header = templateNode.querySelector('b');
            header.innerText = name;

            // If we have an preview image for page we want to show it
            var img = templateNode.querySelector('img');
            var iframe = templateNode.querySelector('iframe');

            if (img) {
              img.onerror = function () {
                // If no preview image can be found, hide img element.
                this.style.display = 'none';
                // and show template in iframe
                var iframe = this.nextElementSibling;
                if (iframe) {
                  // as no preview image was set for templat, show template in iframe
                  iframe.setAttribute('src', iframe.getAttribute('data-staticweb-src'));
                  iframe.style.display = 'block';
                }
              }
              img.setAttribute('src', previewImagePath);
            }

            // we want o store
            var iframe = templateNode.querySelector('iframe');
            if (iframe) {
              iframe.setAttribute('data-staticweb-src', path);
            }

            templateContainer.appendChild(templateNode);
          }
        }
      });
    },
    onStorageReady: function (storage) {
      var self = this;
    },
    init: function (element) {
      var self = this;
      self._element = element;
      self.createInterface();
    }
  }
  staticWeb.registerComponent('sw-onpage-page-create-dialog', Dialog);

})(window.StaticWeb);