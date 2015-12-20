/**
 * Order Directive
 */
angular.module('timeLogger')
    .directive('orderDirective', function($parse) {

        var DIRECTIVE_NAME = 'orderDirective';

        var link = function($scope, element, attrs) {
            var args = getDirectiveArgs(attrs);

            element.on('click', function() {
                $scope.$apply(function(){
                    var data = getDirectiveData($scope, args);

                    if (data.order) {
                        setOrder(data.order, data.value);
                        setScopeData($scope, args.object, data.order);
                    }
                });
            });
        };

        var getDirectiveArgs = function(attrs) {
            var args = attrs[DIRECTIVE_NAME].split(' ');
            return {
                object: args[0],
                value: args[1]
            };
        };

        var getDirectiveData = function(scope, args) {
            return {
                order: getScopeData(scope, args.object),
                value: getScopeData(scope, args.value)
            };
        };

        var getScopeData = function(scope, key) {
            return $parse(key)(scope);
        };

        var setScopeData = function(scope, key, value) {
            return $parse(key).assign(scope, value);
        };

        var setOrder = function(order, property) {
            if (order.property === property) {
                order.reverse = !order.reverse;
            } else {
                order.property = property;
                order.reverse = false;
            }
        };

        return {
            restrict: 'A',
            scope: false,
            link: link
        };
    });
