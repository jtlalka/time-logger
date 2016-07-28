/**
 * Callback function filter.
 */
angular.module('timeLogger')
    .filter('func', function () {
        return function(input, callback, args) {
            return callback(input, args);
        };
    });


/**
 * Capitalize first letter filter.
 */
angular.module('timeLogger')
    .filter('firstLetterUp', function () {
        return function(input) {
            if (input && input.length > 0) {
                return input.charAt(0).toUpperCase() + input.slice(1);
            } else {
                return input;
            }
        };
    });


/**
 * Counting Working time based on day.
 */
angular.module('timeLogger')
    .filter('countWorkTime', function (historyDao) {
        return function(input) {
            if (input) {
                return historyDao.getDailyWorkTime(input);
            } else {
                return input;
            }
        };
    });


/**
 * Days And Time formatter filter.
 */
angular.module('timeLogger')
    .filter('timeFormat', function ($filter, commonService) {

        var dayInMillisecond = commonService.toMillisecond(0, 0, 24);
        var time = 0;

        var positiveFilter = function(time, flag) {
            return flag && flag === 'positive' && time < 0;
        };

        var negativeFilter = function(time, flag) {
            return flag && flag === 'negative' && time > 0;
        };

        var roundToFullSeconds = function(time) {
            return Math.floor(time / 1000) * 1000;
        };

        var getStringDays = function(time) {
            var days = Math.floor(time / dayInMillisecond);
            return days > 1 ? days + ' days ' : days + ' day ';
        };

        var getStringTime = function(time) {
            return $filter('date')(time, 'HH:mm', 'UTC');
        };

        return function(input, flag) {
            if (positiveFilter(input, flag) || negativeFilter(input, flag)) {
                time = 0;
            } else {
                time = Math.abs(roundToFullSeconds(input));
            }
            if (time > dayInMillisecond) {
                return getStringDays(time) + getStringTime(time % dayInMillisecond);
            } else {
                return getStringTime(time);
            }
        };
    });
