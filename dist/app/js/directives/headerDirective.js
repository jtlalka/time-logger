/**
 * Header Directive
 */
angular.module('timeLogger')
    .directive('headerDirective', function ($location, routerConfig) {
        return {
            restrict: 'A',
            templateUrl: chrome.runtime.getURL('app/html/templates/headerTemplate.html'),
            scope: {
                topic: '=headerDirective'
            },
            link: function($scope) {

                $scope.views = routerConfig;

                $scope.isOpen = function(view) {
                    return $location.path() === '/' + view;
                };

                $scope.openView = function(view) {
                    $location.path(view).search({router: 'true'});
                };
            }
        };
    });
