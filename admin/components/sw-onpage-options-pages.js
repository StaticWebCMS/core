(function (staticWeb, undefined) {
    "use strict";
    var NavNode = function (path, parentElementOrNode, template) {
        if (!(this instanceof NavNode)) {
            return new NavNode(path, parentElementOrNode, template);
        }
        return this.init(path, parentElementOrNode, template);
    }
    NavNode.prototype = {
        init: function (path, parentElementOrNode, template) {
            var self = this;

            this._path = false;
            this._displayName = false;
            this._children = [];
            this._hasRequestedChildren = false;
            this._parent = false;
            this._parentElement = false;
            this._element = false;
            this._template = template;
            this._childrenContainer = false;

            this.setPath(path);
            this.setDisplayName(path);

            if (parentElementOrNode instanceof NavNode) {
                this._parent = parentElementOrNode;

                var parentElement = this._parent.getChildrenContainer();
                this._parentElement = parentElement;
            } else {
                this._parentElement = parentElementOrNode;
            }

            var swItemTemplate = template.querySelector('sw-item');
            var li = swItemTemplate.children[0].cloneNode(true);

            li.setAttribute('title', self.getDisplayName());
            li.setAttribute('data-sw-nav-item-path', self.getPath());

            var link = li.querySelector('.sw-onpage-navigation-item-link');
            link.href = self.getPath();
            link.innerText = self.getDisplayName();

            var delLink = li.querySelector('.sw-onpage-navigation-item-delete');
            var addLink = li.querySelector('.sw-onpage-navigation-item-add');

            // We are not allowed to remove root page, so remove delete button
            if (this.getPath() === "/") {
                delLink.remove();
            }

            addLink.addEventListener('click', function (e) {
                //alert('add page under: ' + self.getDisplayName());
                staticWeb.retrieveTemplate("sw-onpage-page-create-dialog", function (dialogTemplate) {
                    var body = document.querySelector('body');
                    var dialog = dialogTemplate.cloneNode(true).querySelector('sw-dialog').children[0];
                    body.appendChild(dialog);
                });
            });
            delLink.addEventListener('click', function (e) {
                alert('del: ' + self.getDisplayName());
            });

            this._element = li;
        },
        getChildrenContainer: function () {
            var self = this;
            if (!self._childrenContainer) {
                var element = self._element;
                var rootTemplate = self._template.querySelector('sw-root');
                var ulList = rootTemplate.children[0].cloneNode(true);

                var placeholder = element.querySelector('sw-item-children-placeholder');
                var parent = placeholder.parentNode;
                parent.replaceChild(ulList, placeholder);
                self._childrenContainer = ulList;
            }
            return self._childrenContainer;
        },
        getElement: function () {
            return this._element;
        },
        getParent: function () {
            return this._parent;
        },
        getPath: function () {
            return this._path;
        },
        setPath: function (path) {
            // remove index.html from path
            var path = path.toLowerCase().replace('/index.html', '');
            // Ensure that last char is slash
            if (path.length > 0 && path[path.length - 1] !== '/') {
                path = path + '/';
            }
            // dont allow empty path (Assume root node)
            if (path === '') {
                path = '/';
            }
            this._path = path;
        },
        getDisplayName: function () {
            return this._displayName;
        },
        setDisplayName: function (path) {
            if (!path) {
                return;
            }

            // remove index.html from path
            var name = path.toLowerCase().replace('/index.html', '');
            // remove ending slash
            if (name.length > 0 && name[name.length - 1] === '/') {
                name = name.substring(0, name.length - 1);
            }

            // get last folder name
            var tmp = name.split('/');
            name = tmp[tmp.length - 1];

            // If name is empty, we will asume it is root
            if (name === '') {
                name = '/';
            }

            // Make sure we have Title case on display name
            if (name && name.length > 0) {
                name = name.substring(0, 1).toUpperCase() + name.substring(1);
            }

            this._displayName = name;
        },
        getChildren: function (callback) {
            var self = this;
            // We have already ensured we have all children, return them
            if (this._hasRequestedChildren) {
                callback(self._children);
                return;
            }

            // TODO: Show spinner for current node

            staticWeb.storage.list(self.getPath(), function (list, callStatus) {
                if (callStatus.isOK) {
                    for (var i = 0; i < list.length; i++) {
                        // We assume that paths with '.' are files and everthing else are folders.
                        // FIX: Waiting for freightCrane issue #23 to help us
                        if (list[i].path.indexOf('.') === -1) {
                            // Ignore all paths in the ignore path settings
                            if (!staticWeb.inAdminPath() && staticWeb.config.onPage.navigation.ignorePaths.indexOf(list[i].name) !== -1) {
                                continue;
                            }

                            var child = new NavNode(list[i].path, self, self._template);
                            self._children.push(child);
                        }
                    }
                    // sort navnodes by display name
                    self._children.sort(self.sortBy);

                    // add children to dom.
                    for (var i = 0; i < self._children.length; i++) {
                        var container = self.getChildrenContainer();
                        container.appendChild(self._children[i].getElement());
                    }

                    self._hasRequestedChildren = true;
                } else if (callStatus.code === 404) {
                    self._hasRequestedChildren = true;
                }

                // TODO: remove spinner for current node

                callback(self._children);
            });
        },
        sortBy: function (a, b) {
            var aPath = a.getDisplayName().toLowerCase();
            var bPath = b.getDisplayName().toLowerCase();

            if (aPath < bPath) {
                return -1;
            }
            if (aPath > bPath) {
                return 1;
            }
            return 0;
        }
    }

    var Options = function () {
        if (!(this instanceof Options)) {
            return new Options();
        }

        return this.init();
    }
    Options.prototype = {
        createInterface: function () {
            var self = this;

            staticWeb.retrieveTemplate("sw-onpage-options-pages", function (template) {
                var elements = staticWeb.elements["sw-onpage-options-pages"].instances;
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];

                    var rootTemplate = template.querySelector('sw-root');
                    var ulList = rootTemplate.children[0].cloneNode(true);
                    element.appendChild(ulList);

                    var rootNode = new NavNode('/', ulList, template);
                    ulList.appendChild(rootNode.getElement());
                    self.renderTree(rootNode);
                }
            });
        },
        renderTree: function (node) {
            var self = this;
            // Should we call for more children
            node.getChildren(function (childNodes) {
                for (var i = 0; i < childNodes.length; i++) {
                    self.renderTree(childNodes[i]);
                }
            });
        },
        init: function () {
            var self = this;
            self.createInterface();
        }
    }
    staticWeb.components.swOnPageOptions = Options();
    window.NavNode = NavNode;
})(window.StaticWeb);