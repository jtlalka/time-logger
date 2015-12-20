/**
 * Reduce Directive
 */
angular.module('timeLogger')
    .directive('reduceDirective', function($parse) {

        var DIRECTIVE_NAME = 'reduceDirective';

        var link = function($scope, element, attrs) {
            var args = getDirectiveArgs(attrs);

            element.on('click', function() {
                $scope.$apply(function() {
                    var data = getDirectiveData($scope, args);

                    if (data.reduce) {
                        setReduce(data.reduce, data.property, data.value);
                        setScopeData($scope, args.object, data.reduce);
                    }
                });
            });
        };

        var getDirectiveArgs = function(attrs) {
            var args = attrs[DIRECTIVE_NAME].split(' ');
            return {
                object: args[0],
                property: args[1],
                value: args[2]
            };
        };

        var getDirectiveData = function(scope, args) {
            return {
                reduce: getScopeData(scope, args.object),
                property: getScopeData(scope, args.property),
                value: getScopeData(scope, args.value)
            };
        };

        var getScopeData = function(scope, arg) {
            return $parse(arg)(scope);
        };

        var setScopeData = function(scope, key, value) {
            return $parse(key).assign(scope, value);
        };

        var setReduce = function(reduce, property, value) {
            if (property) {
                reduce.property = property;
                reduce.value = value;
            } else {
                reduce.property = null;
                reduce.value = null;
            }
        };

        return {
            restrict: 'A',
            scope: false,
            link: link
        };
    });
