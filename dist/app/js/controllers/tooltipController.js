/**
 * Tooltip Controller
 */
angular.module('timeLogger')
    .controller('tooltipController', function($scope, $routeParams, $q, loggerService, commonService,
            optionsDao, historyDao, statusDao) {

        $scope.data = {
            viewDate: null,
            hoursPerDay: 5,
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

            var optionsPromise = optionsDao.getOptions();
            var historyPromise = historyDao.getHistory();
            var statusPromise = statusDao.getStatus();

            $q.all([optionsPromise, historyPromise, statusPromise]).then(function(data) {
                refreshOptionsDara(data[0]);
                refreshHistoryData(data[1], data[2]);
                loggerService.trace('TooltipController init data:', data);
            });
        };

        var refreshOptionsDara = function(options) {
            $scope.data.hoursPerDay = optionsDao.getHoursPerDay(options, $scope.data.viewDate);
            $scope.data.timePerDay = commonService.toMillisecond(0, 0, $scope.data.hoursPerDay);
        };

        var refreshHistoryData = function(history, status) {
            if (historyDao.dateToInteger($scope.data.viewDate) === historyDao.dateToInteger(Date.now())) {
                history = historyDao.updateHistoryStatus(history, status, $scope.data.hoursPerDay);
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

        $scope.isReduced = function(reduce, value) {
            if (reduce.property && reduce.value !== value) {
                return 'reduced';
            } else {
                return '';
            }
        };
    });
