/**
 * Chrome Event Service
 */
angular.module('timeLogger')
    .service('updateService', function($q, loggerService, commonService, optionsDao, historyDao, statusDao) {

        this.checkUpdates = function() {
            var optionsPromise = updateOptions();
            var historyPromise = updateHistory();
            var statusPromise = updateStatus();

            return $q.all([optionsPromise, historyPromise, statusPromise]);
        };

        var updateManager = function(updates, data, name) {
            var updateSum = updates.length;

            if (commonService.isNumber(data.version)) {
                for (var i = data.version; i < updateSum; i++) {
                    data = updates[i](data);

                    if (commonService.isDefined(data)) {
                        loggerService.trace('UpdateService: update ' + name + ' to version ' + (i + 1), data);
                    } else {
                        loggerService.error('UpdateService: update ' + name + ' - function not return value.');
                    }
                }
            }
            data.version = updateSum;
            return data;
        };

        var updateOptions = function() {
            var updates = [
            ];

            return optionsDao.persistOptions(function(data) {
                return updateManager(updates, data, 'options');
            });
        };

        var updateHistory = function() {
            var updates = [
                function(history) {
                    if (commonService.isDefined(history.overTime)) {
                        delete history.overTime;
                    }
                    return history;
                },

                function(history) {
                    var values = [];
                    for (var key in history.daily) {
                        if (history.daily.hasOwnProperty(key)) {
                            values = history.daily[key].values;
                            history.daily[key].calculated = values && historyDao.isPastDay(values[0].start);
                        }
                    }
                    return history;
                }
            ];

            return historyDao.persistHistory(function(data) {
                return updateManager(updates, data, 'history');
            });
        };

        var updateStatus = function() {
            var updates = [
            ];

            return statusDao.persistStatus(function(data) {
                return updateManager(updates, data, 'status');
            });
        };
    });
