/**
 * Tooltip Controller
 */
angular.module('timeLogger')
    .controller('tooltipController', function($scope, $routeParams, $q, loggerService, modalService, commonService,
            optionsDao, historyDao, statusDao) {

        $scope.data = {
            viewDate: null,
            timePerDay: 0
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
            } else {
                $scope.data.viewDate = new Date();
            }
            refreshControllerData();
        };

        var refreshControllerData = function() {
            var optionsPromise = optionsDao.getOptions();
            var historyPromise = historyDao.getHistory();
            var statusPromise = statusDao.getStatus();

            $q.all([optionsPromise, historyPromise, statusPromise]).then(function(data) {
                refreshOptionsDara(data[0]);
                refreshHistoryData(data[1], data[0], data[2]);
                loggerService.trace('TooltipController init data.', data);
            });
        };

        var refreshOptionsDara = function(options) {
            $scope.data.timePerDay = optionsDao.getTimePerDay(options, $scope.data.viewDate);
        };

        var refreshHistoryData = function(history, options, status) {
            if (historyDao.isPresentDay($scope.data.viewDate)) {
                var activity = optionsDao.getActivityByType(options, status.type);
                history = historyDao.updateHistoryStatus(history, status, activity, $scope.data.timePerDay);
            }
            $scope.daily = historyDao.getDailyHistory(history, $scope.data.viewDate);
            $scope.daily.values = extendDailyValues($scope.daily.values);
        };

        var extendDailyValues = function(values) {
            for (var i = 0, len = values.length; i < len; i++) {
                values[i].id = i;
                values[i].delta = historyDao.getDeltaTime(values[i].start, values[i].stop);
            }
            return values;
        };

        $scope.deleteDailyValue = function(value) {
            var key = historyDao.dateToInteger($scope.data.viewDate);

            modalService.confirm('Do you want delete this item from daily history?').then(function() {
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
