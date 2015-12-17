/**
 * Toggle Directive
 */
angular.module('timeLogger')
    .directive('toggleDirective', function($parse) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, element, args) {

                var toggleEvent = function() {
                    $scope.$apply(function() {
                        var toggleKey = args.toggleDirective;
                        var toggleValue = $parse(toggleKey)($scope);

                        $parse(toggleKey).assign($scope, !toggleValue);
                    });
                };

                /**
                 * Setup Click Event
                 */
                element.on('click', toggleEvent);

                /**
                 * Destroy Click Event
                 */
                $scope.$on('$destroy', function() {
                    element.off('click', toggleEvent);
                });
            }
        };
    });
