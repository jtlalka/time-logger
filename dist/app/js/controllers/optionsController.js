/**
 * Options Controller
 */
angular.module('timeLogger')
    .controller('optionsController', function($scope, $routeParams, $timeout, modalService, loggerService,
            commonService, optionsDao) {

        $scope.data = {
            timePerDay: [],
            timeOptions: optionsDao.getTimeOptions()
        };

        $scope.display = {
            header: false,
            update: false
        };

        $scope.refresh = function() {
            $scope.display.header = $routeParams.router;

            optionsDao.getOptions().then(function(options) {
                $scope.options = options;
                loggerService.trace('OptionsController: init data.', options);
            });
        };

        $scope.checkWorkingTime = function() {
            $scope.options.timePerWeek = 0;

            for (var i = 0, len = $scope.options.timePerDay.length; i < len; i++) {
                if ($scope.options.timePerDay[i]) {
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
                    $scope.options = options;
                    $scope.display.update = false;
                    $scope.optionsForm.$setPristine();
                }, 200);
            });
        };

        $scope.formatTimePerWeek = function(time) {
            var hourInMillisecond = commonService.toMillisecond(0, 0, 1);
            var hours = Math.floor(time / hourInMillisecond);
            var minutes = Math.floor(time % hourInMillisecond / 60 / 1000);
            return ('00' + hours).substr(-2) + ':' + ('00' + minutes).substr(-2);
        };

        $scope.showActivityHelp = function() {
            modalService.inform([
                'You can specify which of your daily activities will be calculated as working time:',
                '<ul class="padding-x1">',
                '<li><strong>active</strong> - time actively spent at a computer,</li>',
                '<li><strong>idle</strong> - time spent at a computer without any actions,</li>',
                '<li><strong>locked</strong> - time when computer is logged out.</li>',
                '</ul>',
                'Maximum time of single event is configurable for reducing activities which are not part',
                ' of your working time. ',
                'If single activity is over time limit, this event will not be added to daily activities.'
            ].join(''));
        };

        $scope.showWorkingHelp = function() {
            modalService.inform([
                'You can specify how many hours you should work each days. ',
                'Based on these numbers this extension will calculate balance of your daily ',
                'working time and general overtime.'
            ].join(''));
        };
    });
