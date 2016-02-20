/**
 * Toggle Directive
 */
angular.module('timeLogger')
    .directive('scrollDirective', function($parse, $timeout) {

        var DIRECTIVE_NAME = 'scrollDirective';
        var BUFFER_SIZE = 0.2;

        var link = function($scope, element, attributes) {

            var args = getDirectiveArg(attributes);
            var limit = getDataFromScope($scope, args.limit);
            var buffer = Math.round(limit * BUFFER_SIZE);
            var lastTop = 0;
            var lastHeight = 0;

            var updateLimit = function() {
                var item = element[0];

                if (isDownDirection(item) && isInProgress(item) && isInPosition(item)) {
                    $timeout(function() {
                        limit += buffer;
                        lastTop = item.scrollTop;
                        lastHeight = item.scrollHeight;
                        setDataOnScope($scope, args.limit, limit);
                    });
                }
            };

            var isDownDirection = function(item) {
                return lastTop < item.scrollTop;
            };

            var isInProgress = function(item) {
                return lastHeight < item.scrollHeight;
            };

            var isInPosition = function(item) {
                return item.scrollTop + item.offsetHeight + (item.scrollHeight * BUFFER_SIZE) > item.scrollHeight;
            };

            element.bind('scroll', updateLimit);

            element.bind('resize', updateLimit);

            $scope.$on('$destroy', function() {
                element.off('scroll', updateLimit);
                element.off('resize', updateLimit);
            });
        };

        var getDirectiveArg = function(attributes) {
            return {
                limit: attributes[DIRECTIVE_NAME]
            };
        };

        var getDataFromScope = function(scope, key) {
            return $parse(key)(scope);
        };

        var setDataOnScope = function(scope, key, value) {
            return $parse(key).assign(scope, value);
        };

        return {
            restrict: 'A',
            scope: false,
            link: link
        };
    });
