/**
 * Toggle Directive
 */
angular.module('timeLogger')
    .directive('toggleDirective', function($parse) {
        return {
            restrict: 'A',
            scope: false,
            link: function($scope, element, args) {

                /**
                 * OnClick Event
                 */
                element.on('click', function() {
                    $scope.$apply(function() {
                        var toggleKey = args.toggleDirective;
                        var toggleValue = $parse(toggleKey)($scope);

                        $parse(toggleKey).assign($scope, !toggleValue);
                    });
                });
            }
        };
    });
