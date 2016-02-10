/**
 * Tooltip Controller
 */
angular.module('timeLogger')
    .controller('tooltipController', function($scope, $routeParams, $q, loggerService, modalService, commonService,
            optionsDao, historyDao, statusDao) {

        $scope.data = {
            viewDate: null,
            isPresentDay: true,
            stepTime: commonService.toMillisecond(0, 0, 1),
            totalTime: commonService.toMillisecond(0, 0, 12),
            scaleTimes: optionsDao.getTimeScale(),
            workTime: 0
        };

        $scope.display = {
            history: false
        };

        $scope.order = {
            property: 'start',
            reverse: false
        };

        $scope.reduce = {
            property: null,
            value: null
        };

        $scope.refresh = function() {
            if ($routeParams.date) {
                $scope.data.viewDate = new Date(parseInt($routeParams.date, 10));
                $scope.data.isPresentDay = false;
            } else {
                $scope.data.viewDate = new Date();
                $scope.data.isPresentDay = true;
            }
            refreshControllerData();
        };

        var refreshControllerData = function() {
            var optionsPromise = optionsDao.getOptions();
            var historyPromise = historyDao.getHistory();
            var statusPromise = statusDao.getStatus();

            $q.all([optionsPromise, historyPromise, statusPromise]).then(function(data) {
                refreshHistoryData(data[1], data[0], data[2]);
                loggerService.trace('TooltipController init data.', data);
            });
        };

        var refreshHistoryData = function(history, options, status) {
            if ($scope.data.isPresentDay) {
                var activity = optionsDao.getActivityByType(options, status.type);
                var timePerDay = optionsDao.getTimePerDay(options, $scope.data.viewDate);

                history = historyDao.updateHistoryStatus(history, status, activity, timePerDay);
            }
            $scope.daily = historyDao.getDailyHistory(history, $scope.data.viewDate);
            $scope.daily.values = extendDailyValues($scope.daily.values);
            $scope.data.workTime = calculateWorkTime($scope.daily);
        };

        var extendDailyValues = function(values) {
            for (var i = 0, len = values.length; i < len; i++) {
                values[i].id = i;
                values[i].delta = historyDao.getDeltaTime(values[i].start, values[i].stop);
            }
            return values;
        };

        var calculateWorkTime = function(daily) {
            return historyDao.getDailyWorkTime(daily.types) - daily.overTime;
        };

        $scope.deleteDailyValue = function(value) {
            var key = historyDao.dateToInteger($scope.data.viewDate);

            modalService.confirm('Do you want delete this event from daily history?').then(function() {
                historyDao.persistHistory(function(history) {
                    return historyDao.deleteDailyValue(history, key, value.id);
                }).then(function(history) {
                    loggerService.info('HistoryController: item was deleted from day.', history);
                    refreshControllerData();
                });
            });
        };

        $scope.isReduced = function(reduce, value) {
            if (reduce.property && reduce.value !== value) {
                return 'reduced';
            } else {
                return '';
            }
        };
    });
