/**
 * Options Controller
 */
angular.module('timeLogger')
    .controller('optionsController',
        function($scope, $routeParams, $timeout, loggerService, commonService, optionsDao) {

        $scope.data = {
            minHoursPerWeek: 0,
            maxHoursPerWeek: 80,
            hoursPerDayValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            lockedTimeValues: [
                commonService.toMillisecond(0),
                commonService.toMillisecond(0, 30),
                commonService.toMillisecond(0, 60),
                commonService.toMillisecond(0, 90),
                commonService.toMillisecond(0, 120),
                commonService.toMillisecond(0, 150)
            ]
        };

        $scope.display = {
            update: false,
            header: false
        };

        $scope.refresh = function() {
            $scope.display.header = $routeParams.router;

            optionsDao.getOptions().then(function(data) {
                $scope.options = data;
            });
        };

        $scope.checkWorkingTime = function() {
            $scope.options.hoursPerWeek = 0;

            for (var key in $scope.options.hoursPerDay) {
                if ($scope.options.hoursPerDay.hasOwnProperty(key)) {
                    $scope.options.hoursPerWeek += $scope.options.hoursPerDay[key];
                }
            }
        };

        $scope.updateOptions = function() {
            $scope.display.update = true;

            optionsDao.updateOptions($scope.options).then(function(data) {
                loggerService.info('OptionsController: update options.');

                $timeout(function() {
                    $scope.options = data;
                    $scope.display.update = false;
                    $scope.optionsForm.$setPristine();
                }, 200);
            });
        };
    });
