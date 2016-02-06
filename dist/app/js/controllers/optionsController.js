/**
 * Options Controller
 */
angular.module('timeLogger')
    .controller('optionsController', function($scope, $routeParams, $timeout, modalService, loggerService,
            commonService, optionsDao) {

        $scope.data = {
            timePerDay: [],
            minTimePerDay: new Date(commonService.toMillisecond(0)),
            maxTimePerDay: new Date(commonService.toMillisecond(0, 0, 12)),

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
            header: false,
            update: false
        };

        $scope.refresh = function() {
            $scope.display.header = $routeParams.router;

            optionsDao.getOptions().then(function(data) {
                refreshControllerData(data);
            });
        };

        var refreshControllerData = function(data) {
            $scope.options = data;

            for (var i = 0, len = $scope.options.timePerDay.length; i < len; i++) {
                $scope.data.timePerDay[i] = commonService.toUTCDate($scope.options.timePerDay[i]);
            }
        };

        $scope.checkWorkingTime = function() {
            $scope.options.timePerWeek = 0;

            for (var i = 0, len = $scope.options.timePerDay.length; i < len; i++) {
                if ($scope.data.timePerDay[i]) {
                    $scope.options.timePerDay[i] = commonService.dateToTime($scope.data.timePerDay[i]);
                    $scope.options.timePerWeek += $scope.options.timePerDay[i];
                } else {
                    $scope.options.timePerDay[i] = 0;
                }
            }
        };

        $scope.updateOptions = function() {
            $scope.display.update = true;

            optionsDao.updateOptions($scope.options).then(function(options) {
                loggerService.info('OptionsController: update options.', options);

                $timeout(function() {
                    refreshControllerData(options);
                    $scope.display.update = false;
                    $scope.optionsForm.$setPristine();
                }, 200);
            });
        };

        $scope.formatTimePerWeek = function(time) {
            var hourInMillisecond = commonService.toMillisecond(0, 0, 1);
            var hours = Math.floor(time / hourInMillisecond);
            var minutes = Math.floor(time % hourInMillisecond / 60 / 1000);
            return hours + (minutes < 10 ? ' : 0' + minutes : ' : ' + minutes);
        };

        $scope.showNotificationHelp = function() {
            modalService.inform('This function will be implemented in future.');
        };
    });
