/**
 * Detail Controller
 */
angular.module('timeLogger')
    .controller('historyController', function($scope, $location, modalService, loggerService, commonService,
            historyDao) {

        $scope.data = {
            dailyArray: [],
            timeFrame: {},
            barSize: commonService.toMillisecond(0, 0, 12),
            fromFlag: false,
            fromDate: null,
            toFlag: false,
            toDate: null
        };

        $scope.display = {
            limit: 100,
            step: 20
        };

        $scope.order = {
            property: 'date',
            reverse: true
        };

        $scope.refresh = function() {
            historyDao.getHistory().then(function(history) {
                refreshControllerData(history);
                loggerService.trace('HistoryController: init data.', history);
            });
        };

        $scope.updateTimeFrame = function() {
            historyDao.persistHistory(function(history) {
                var beginKey = dateToKey($scope.data.fromDate);
                var endKey = dateToKey($scope.data.toDate);

                return historyDao.updateTimeFrameHistory(history, beginKey, endKey);
            }).then(function(history) {
                refreshControllerData(history);
                $scope.timeForm.$setPristine();
                loggerService.info('HistoryController: update time frame.', history);
            });
        };

        $scope.enableDayToHistory = function(day, $event) {
            $event.stopPropagation();

            historyDao.persistHistory(function(history) {
                return historyDao.enableDayToHistory(history, day.key);
            }).then(function(history) {
                refreshControllerData(history);
                loggerService.info('HistoryController: day was enable in history.', history);
            });
        };

        $scope.disableDayFromHistory = function(day, $event) {
            $event.stopPropagation();

            historyDao.persistHistory(function(history) {
                return historyDao.disableDayFromHistory(history, day.key);
            }).then(function(history) {
                refreshControllerData(history);
                loggerService.info('HistoryController: day was disabled from history.', history);
            });
        };

        $scope.deleteDayFromHistory = function(day, $event) {
            $event.stopPropagation();

            modalService.confirm('Do you want delete this day from history?').then(function() {
                historyDao.persistHistory(function(history) {
                    return historyDao.deleteDayFromHistory(history, day.key);
                }).then(function(history) {
                    refreshControllerData(history);
                    loggerService.info('HistoryController: day was deleted from history.', history);
                });
            });
        };

        var refreshControllerData = function(history) {
            history = historyDao.filterTimeFrameDays(history);
            history = historyDao.filterCalculatedDays(history);

            refreshTimeFrame(history.timeFrame);
            refreshDailyArray(history.daily);
        };

        var refreshTimeFrame = function(timeFrame) {
            $scope.data.timeFrame = timeFrame;

            $scope.data.fromFlag = commonService.isDefined(timeFrame.beginDate);
            $scope.data.fromDate = keyToDate(timeFrame.beginDate);

            $scope.data.toFlag = commonService.isDefined(timeFrame.endDate);
            $scope.data.toDate = keyToDate(timeFrame.endDate);
        };

        var refreshDailyArray = function(days) {
            $scope.data.dailyArray.length = 0;

            for (var key in days) {
                if (days.hasOwnProperty(key)) {
                    days[key].key = key;
                    days[key].date = keyToDate(key);
                    days[key].values.length = 0;

                    $scope.data.dailyArray.push(days[key]);
                }
            }
        };

        var keyToDate = function(number) {
            return number ? historyDao.integerToDate(number) : null;
        };

        var dateToKey = function(date) {
            return date ? historyDao.dateToInteger(date) : null;
        };

        $scope.clearFromData = function() {
            if ($scope.data.fromFlag === false) {
                $scope.data.fromDate = null;
            }
        };

        $scope.clearToData = function() {
            if ($scope.data.toFlag === false) {
                $scope.data.toDate = null;
            }
        };

        $scope.openTooltip = function(date) {
            $location.path('tooltip').search({date: date.getTime()});
        };
    });
