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
                element.css(getElementStyle(newValue, data.total));
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

        var getElementStyle = function(value, total) {
            var itemWidth = 0;

            if (value > 0 && total > 0) {
                itemWidth = value * 100 / total;
            }
            return {'width': itemWidth + '%'};
        };

        return {
            restrict: 'A',
            scope: false,
            link: link
        };
    });
