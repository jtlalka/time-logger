/**
 * Detail Controller
 */
angular.module('timeLogger')
    .controller('historyController', function($scope, $location, loggerService, commonService, historyDao) {

        $scope.data = {
            barSize: commonService.toMillisecond(0, 0, 12),
            fromFlag: false,
            fromDate: null,
            toFlag: false,
            toDate: null
        };

        $scope.refresh = function() {
            historyDao.getHistory().then(function(data) {
                $scope.history = initHistoryObject(data);
            });
        };

        $scope.updateTimeFrame = function() {
            historyDao.persistHistory(function(history) {
                var beginKey = dateToKey($scope.data.fromDate);
                var endKey = dateToKey($scope.data.toDate);

                return historyDao.updateTimeFrameHistory(history, beginKey, endKey);
            }).then(function(history) {
                $scope.history = initHistoryObject(history);
                $scope.timeForm.$setPristine();
                loggerService.info('HistoryController: update time frame.', history);
            });
        };

        var initHistoryObject = function(history) {
            history = historyDao.filterTimeFrame(history);
            history = historyDao.filterEmptyDays(history);

            initTimeFrameScope(history.timeFrame);
            return extendHistoryObject(history);
        };

        var initTimeFrameScope = function(timeFrame) {
            $scope.data.fromFlag = commonService.isDefined(timeFrame.beginDate);
            $scope.data.fromDate = keyToDate(timeFrame.beginDate);

            $scope.data.toFlag = commonService.isDefined(timeFrame.endDate);
            $scope.data.toDate = keyToDate(timeFrame.endDate);
        };

        var extendHistoryObject = function(history) {
            for (var key in history.daily) {
                if (history.daily.hasOwnProperty(key)) {
                    history.daily[key].date = keyToDate(key);
                    history.daily[key].values = null;
                }
            }
            return history;
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
