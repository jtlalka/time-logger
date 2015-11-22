/**
 * Calculate Width Directive
 */
angular.module('timeLogger')
    .directive('widthDirective', function($parse) {

        var DIRECTIVE_NAME = 'widthDirective';

        var link = function($scope, element, attrs) {
            var args = getDirectiveArgs(attrs);
            var data = getDirectiveData($scope, args);

            $scope.$watch(args[0], function(newValue) {
                element.css(getElementStyle(newValue, data.total, element));
            });
        };

        var getDirectiveArgs = function(attrs) {
            return attrs[DIRECTIVE_NAME].split(' ');
        };

        var getDirectiveData = function(scope, args) {
            return {
                value: getScopeData(scope, args[0]),
                total: getScopeData(scope, args[1])
            };
        };

        var getScopeData = function(scope, arg) {
            return $parse(arg)(scope);
        };

        var getElementStyle = function(value, total, element) {
            var totalWidth = getParentWidth(element);
            var itemWidth = 0;

            if (value > 0 && total > 0) {
                itemWidth = Math.round(value * totalWidth / total);
            }
            return {'width': itemWidth + 'px'};
        };

        var getParentWidth = function(element) {
            return element[0].parentElement.clientWidth;
        };

        return {
            restrict: 'A',
            scope: false,
            link: link
        };
    });
