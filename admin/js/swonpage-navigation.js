/* global StaticWeb */
(function (sw) {

    var navigation = [];
    var locations = [];
    var rootPage = false;

    function getLocations() {
        var loc = location.pathname.replace('index.html', '');
        var locationArray = loc.split('/');
        // remove empty items
        var index = 0;
        while (locationArray.length > index) {
            if (locationArray[index] == "") {
                locationArray.splice(index, 1);
            }
            else {
                index++;
            }
        }

        var locations = [];
        while (locationArray.length) {
            var url = '/' + locationArray.join('/');
            if (url[url.length - 1] !== '/') {
                url = url + '/';
            }

            locations.push(url);
            locationArray.splice(locationArray.length - 1, 1);
        }
        locations.push('/');
        locations.reverse();

        return locations;
    }

    function getPath(name) {
        var name = name.replace('/index.html', '');
        if (name.length > 0 && name[name.length - 1] !== '/') {
            name = name + '/';
        }
        if (name === '') {
            name = '/';
        }
        return name;
    }

    function getDisplayName(name) {
        var name = name.replace('/index.html', '');
        if (name.length > 0 && name[name.length - 1] === '/') {
            name = name.substring(0, name.length - 1);
        }

        var tmp = name.split('/');
        name = tmp[tmp.length - 1];

        if (name === '') {
            name = '/';
        }

        return name;
    }

    function sortPageItems(a, b) {
        var aPath = a.displayName.toLowerCase(); // getPath(a.path);
        var bPath = b.displayName.toLowerCase(); // getPath(b.path);

        if (aPath < bPath) {
            return -1;
        }
        if (aPath > bPath) {
            return 1;
        }
        return 0;
    }

    function showCreatePageDialog(addr, folder) {
        var dialog = document.createElement('div');
        dialog.className = 'sw-dialog';
        var dialogHeader = document.createElement('div');
        dialogHeader.className = 'sw-onpage-options-header';
        dialogHeader.innerHTML = 'StaticWeb - Create new page<a href="#" title="Close dialog" class="sw-onpage-navigation-item-close">x</a>';
        dialog.appendChild(dialogHeader);

        var dialogContent = document.createElement('div');
        dialogContent.className = 'sw-dialog-content';
        dialog.appendChild(dialogContent);

        var pageNameElement = document.createElement('div');
        pageNameElement.innerHTML = '<b style="display:block;padding:5px;padding-bottom:10px">Page name:</b><input id="sw-onpage-createpage-parent" type="hidden" value="' + folder + '" /><input id="sw-onpage-createpage-name" type="text" style="font-size:20px" />';
        dialogContent.appendChild(pageNameElement);

        var pageNameElement = document.createElement('div');
        pageNameElement.innerHTML = '<b style="display:block;padding:5px;padding-bottom:10px">Page url:</b><span style="font-size:20px">' + folder + '<input id="sw-onpage-createpage-url" type="text" style="font-size:20px" pattern="[A-Za-z0-9]+" />';
        dialogContent.appendChild(pageNameElement);

        var templates = document.createElement('div');
        templates.innerHTML = '<b style="display:block;padding:5px;padding-bottom:10px;padding-top:30px">Choose template to use:</b>loading page layout...';
        dialogContent.appendChild(templates);

        document.getElementsByTagName('body')[0].appendChild(dialog);

        var closeBtn = document.getElementsByClassName('sw-onpage-navigation-item-close')[0];
        closeBtn.addEventListener('click', function (e) {
            dialog.remove();
        });


        var adminPath = sw.getAdminPath().replace(location.protocol + '//' + location.host, '');
        sw.storage.list(adminPath + 'config/layouts/page/', function (info, status) {
            var list = info;
            if (!list || list.length === 0) {
                templates.innerHTML = '<span>No page layouts found. Please add page layouts to: ' + adminPath + 'config/layouts/page/</span>';
                return;
            }
            var list = arguments[0];
            var elements = [];
            elements.push('<b style="display:block;padding:5px;padding-bottom:10px;padding-top:30px">Choose page layout to use:</b>');

            for (var i = 0; i < list.length; i++) {
                var isPreview = list[i].path.indexOf('.jpg') > 0 || list[i].path.indexOf('.jpeg') > 0 || list[i].path.indexOf('.png') > 0 || list[i].path.indexOf('.gif') > 0;
                var isLayout = list[i].path.indexOf('.html') > 0 || list[i].path.indexOf('.htm') > 0;

                if (isLayout) {
                    var name = list[i].name.replace('.html', '').replace('.htm', '');
                    var path = list[i].path;
                    var previewImagePath = list[i].path.replace('.html', '.jpg').replace('.html', '.jpg');
                    elements.push('<div class="sw-onpage-navigation-createpage-template" data-sw-onpage-createpage-template="' + path + '" style="margin:5px;padding:1px;width:250px;display:inline-block;background-color:#2F5575;color:#fff;vertical-align:top;border-radius:6px;"><b style="display:block;padding:4px">' + name + '</b><img src="' + previewImagePath + '" width="100%" style="cursor:pointer;background: url(https://placehold.it/250x250);height:250px;width:250px" /></div>');
                }
            }
            templates.innerHTML = elements.join('');

            var pageNameInput = document.getElementById('sw-onpage-createpage-name');
            var pageUrlInput = document.getElementById('sw-onpage-createpage-url');
            pageNameInput.addEventListener('keyup', function (e) {
                pageUrlInput.value = pageNameInput.value.toLowerCase().replace(/[^a-z0-9]/ig, '-');
            });
            pageUrlInput.addEventListener('keyup', function (e) {
                var ev = e || event;
                if (ev.which < 40 ||
                    ev.ctrlKey || ev.metaKey || ev.altKey) {
                    return;
                }

                pageUrlInput.value = pageUrlInput.value.toLowerCase().replace(/[^a-z0-9]/g, '-');
            });

            templates.addEventListener('click', function (e) {
                var el = e.target.parentNode;
                if (el.classList.contains('sw-onpage-navigation-createpage-template')) {
                    var inputName = document.getElementById('sw-onpage-createpage-name');
                    var inputUrl = document.getElementById('sw-onpage-createpage-url');
                    var inputFolder = document.getElementById('sw-onpage-createpage-parent');
                    var pageName = inputFolder.value + inputUrl.value + '/index.html';
                    var templateLocation = el.getAttribute('data-sw-onpage-createpage-template');
                    var resultAddress = getPath(pageName);

                    var metadataName = inputFolder.value + inputUrl.value + '/metadata.json';

                    var data = {
                        'name': inputName.value,
                        'url': inputFolder.value + inputUrl.value,
                        'layout': templateLocation
                    };
                    var metadataContent = JSON.stringify(data);

                    sw.addResource(metadataName, metadataContent, function () { });
                    sw.addPage(pageName, templateLocation, function () {
                        dialogContent.innerHTML = "waiting for servers to empty cache, please wait";
                        waitUntilReady(resultAddress);
                    });
                }
            });
        });
    }

    function waitUntilReady(addr) {
        var iframe = document.createElement('iframe');
        var timeout = setTimeout(function () {
            // Clean up iframe
            try {
                iframe.parentElement.removeChild(iframe);
            } catch (error) {
                // do nothing, it is not that critical
            }
            // Do a new try
            waitUntilReady(addr);
            //location.assign(getPath(pageName)); // change location to parent
        }, 1000);
        iframe.onload = function () {
            var scripts = iframe.contentDocument.scripts;
            var hasValidScript = false;
            var test = sw.getAdminPath();

            for (var i = 0; i < scripts.length; i++) {
                if (document.scripts[i].src.indexOf(test)) {
                    hasValidScript = true;
                    break;
                }
            }
            //console.log('test:', hasValidScript);
            if (hasValidScript) {
                clearTimeout(timeout);
                // Clean up iframe
                iframe.parentElement.remove(iframe);
                location.assign(addr); // change location to parent
            }
        };
        iframe.src = addr + "?nocache=" + new Date().getTime();
        document.body.appendChild(iframe);
    }

    function createElement(page, parentNode) {
        parentNode.appendChild(page.element);
        if (page.children.length > 0) {
            var node = document.createElement("ul");
            node.className = 'sw-onpage-navigation-child-items';
            for (var index = 0; index < page.children.length; index++) {
                var child = page.children[index];
                createElement(child, node);
            }
            parentNode.appendChild(node);
        }
    }

    function showNavigation(navigationNode, navigationHeaderNode, navigationListNode) {
        if (!rootPage) {
            return;
        }
        var node = document.createElement("ul");
        node.className = 'sw-onpage-navigation-items';

        createElement(rootPage, node);

        navigationListNode.innerHTML = '';
        navigationListNode.appendChild(node);

        // TODO: event listeners

        navigationNode.setAttribute('data-sw-nav-expandable', '1');
        navigationHeaderNode.style.paddingBottom = '5px';
        navigationHeaderNode.style.borderBottom = 'solid 3px rgb(47, 85, 117)';
    }

    function getChildren(pageItem) {
        sw.storage.list(pageItem.path, function (list, callStatus) {
            if (callStatus.isOK) {
                for (var i = 0; i < list.length; i++) {
                    var childPageItem = createPageItem(list[i].path);
                    if (childPageItem) {
                        pageItem.children.push(childPageItem);
                    }
                }
                pageItem.children.sort(sortPageItems);

                var itemElement = document.getElementsByClassName('sw-onpage-navigation-item')[0];
                var headerElement = itemElement.getElementsByClassName('sw-onpage-options-item-header')[0];
                var contentElement = itemElement.getElementsByClassName('sw-onpage-options-item-content')[0];
                showNavigation(itemElement, headerElement, contentElement);
            }
        });
    }

    function createPageItem(path) {
        // ignore all files (we are only interested in folders)
        if (path.indexOf('.') >= 0) {
            return false;
        }

        var displayName = getDisplayName(path);
        var locationPath = getPath(location.pathname);
        var pagePath = getPath(path);
        var isSelected = (locationPath === pagePath);

        // Ignore all paths in the ignore path settings
        if (!sw.inAdminPath() && sw.config.onPage.navigation.ignorePaths.indexOf(displayName) !== -1) {
            return false;
        }

        var element = document.createElement('li');
        element.id = 'page-' + new Date().getTime();
        if (isSelected) {
            element.className = 'sw-onpage-navigation-item-selected';
            element.setAttribute('data-sw-nav-item-path', pagePath);
        }

        var link = document.createElement('a');
        link.textContent = displayName;
        link.href = pagePath;
        element.appendChild(link);

        if (isSelected) {
            var linkDelete = document.createElement('a');
            linkDelete.textContent = 'x';
            linkDelete.className = 'sw-onpage-navigation-item-delete';
            linkDelete.title = 'Delete ' + displayName;
            linkDelete.href = '#';
            element.appendChild(linkDelete);
            linkDelete.addEventListener('click', function (e) {
                e.preventDefault();
                var addr = e.target.parentNode.getAttribute('data-sw-nav-item-path');
                if (confirm('Are you sure you want to delete "' + addr + '"?')) {
                    sw.storage.get(addr + 'metadata.json', function (status) {
                        sw.storage.del(addr + 'metadata.json', function (status) { });
                    });
                    sw.storage.get(addr + 'index.html', function (status) {
                        sw.storage.del(addr + 'index.html', function (status) {
                            if (status.isOK) {
                                console.log('successfully deleted page', addr);

                                var tmp = getPath(addr);
                                var arr = tmp.split('/');
                                while (arr.pop() === '') {
                                    // Remove all empty items in the back plus one page level.
                                }
                                tmp = arr.join('/');
                                if (tmp == '') {
                                    tmp = '/';
                                }
                                location.assign(tmp); // change location to parent
                            }
                        });
                    });
                }
            });

            var linkAdd = document.createElement('a');
            linkAdd.textContent = '+';
            linkAdd.className = 'sw-onpage-navigation-item-add';
            linkAdd.title = 'Add a sub-page for ' + displayName;
            linkAdd.href = '#';
            element.appendChild(linkAdd);
            linkAdd.addEventListener('click', function (e) {
                e.preventDefault();
                var addr = e.target.parentNode.getAttribute('data-sw-nav-item-path');
                showCreatePageDialog(addr, addr);
            });
        }

        var page = {
            path: pagePath,
            isSelected: isSelected,
            displayName: displayName,
            metaInfo: false,
            element: element,
            children: []
        };

        var noneMatchLength = locationPath.replace(pagePath, '').length;
        var shouldGetChildren = noneMatchLength < locationPath.length;
        if (shouldGetChildren) {
            getChildren(page);
        }

        var itemElement = document.getElementsByClassName('sw-onpage-navigation-item')[0];
        var headerElement = itemElement.getElementsByClassName('sw-onpage-options-item-header')[0];
        var contentElement = itemElement.getElementsByClassName('sw-onpage-options-item-content')[0];
        showNavigation(itemElement, headerElement, contentElement);

        return page;
    }

    var itemElement = document.getElementsByClassName('sw-onpage-navigation-item')[0];
    var headerElement = itemElement.getElementsByClassName('sw-onpage-options-item-header')[0];
    var contentElement = itemElement.getElementsByClassName('sw-onpage-options-item-content')[0];

    // TODO: We are currently getting full site structure, probably not that good, look at improving it.
    rootPage = createPageItem('/');
    showNavigation(itemElement, headerElement, contentElement);

})(StaticWeb);