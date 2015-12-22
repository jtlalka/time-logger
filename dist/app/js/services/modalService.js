/**
 * Modal Service
 */
angular.module('timeLogger')
    .service('modalService', function($rootScope, $compile, $controller, $q) {

        function ModalHelper(scope, element, resolve, reject) {

            this.resolve = function(data) {
                closeModal();
                resolve(data);
            };

            this.reject = function(data) {
                closeModal();
                reject(data);
            };

            var closeModal = function() {
                scope.$destroy();
                element.remove();
            };
        }

        this.confirm = function(message) {
            var template =
                '<div class="margin-x1">' +
                    '<div class="padding-x1">' + message + '</div>' +
                    '<div class="padding-x1 text-right">' +
                        '<button type="button" data-ng-click="modal.resolve()">OK</button>&nbsp;' +
                        '<button type="button" data-ng-click="modal.reject()">Cancel</button>' +
                    '</div>' +
                '</div>';

            return initModal(template, null);
        };

        this.inform = function(message) {
            var template =
                '<div class="margin-x1">' +
                    '<div class="padding-x1">' + message + '</div>' +
                    '<div class="padding-x1 text-right">' +
                        '<button type="button" data-ng-click="modal.resolve()">Close</button>' +
                    '</div>' +
                '</div>';

            return initModal(template, null);
        };

        this.openModal = function(modalData) {
            return initModal(modalData.template, modalData.data, modalData.controller);
        };

        var initModal = function(template, data, controller) {
            return $q(function(resolve, reject) {
                var element = angular.element(initHtml(template));

                var modalScope = $rootScope.$new(false);
                modalScope.modal = new ModalHelper(modalScope, element, resolve, reject);
                modalScope.data = data;

                if (angular.isDefined(controller)) {
                    var modalCtrl = $controller(controller, {
                        $scope: modalScope
                    });
                    element.data('$ngControllerController', modalCtrl);
                }

                $compile(element)(modalScope);
            });
        };

        var initHtml = function(template) {
            var modal = getModalElement();
            modal.innerHTML = template;

            var wrapper = getWrapperElement();
            wrapper.appendChild(modal);

            var main = getMainElement();
            main.appendChild(wrapper);

            var body = getBodyElement();
            body.appendChild(main);

            return main;
        };

        var getBodyElement = function() {
            return document.getElementsByTagName('body')[0];
        };

        var getMainElement = function() {
            var div = document.createElement('div');
            div.style.backgroundColor = 'rgba(17, 17, 17, 0.7)';
            div.style.position = 'absolute';
            div.style.top = '0';
            div.style.left = '0';
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.zIndex = '1000';
            div.style.cursor = 'default';
            div.style.overflow = 'hidden';
            return div;
        };

        var getWrapperElement = function() {
            var div = document.createElement('div');
            div.style.position = 'relative';
            div.style.top = '28%';
            div.style.left = '0';
            div.style.padding = '0 60px 10px';
            return div;
        };

        var getModalElement = function() {
            var div = document.createElement('div');
            div.style.backgroundColor = '#eee';
            div.style.border = '1px solid #111';
            div.style.boxShadow = '0 0 20px #111';
            div.style.overflow = 'hidden';
            div.style.maxWidth = '500px';
            div.style.margin = '0 auto';
            div.style.color = '#000';
            return div;
        };
    });
