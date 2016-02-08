/**
 * Chrome Event Service
 */
angular.module('timeLogger')
    .service('updateService', function($q, loggerService, commonService, optionsDao, historyDao, statusDao) {

        this.checkUpdates = function() {
            var optionsPromise = updateOptions();
            var historyPromise = updateHistory();
            var statusPromise = updateStatus();

            loggerService.info('UpdateService: check for updates.');
            return $q.all([optionsPromise, historyPromise, statusPromise]);
        };

        var updateManager = function(updates, data, name, versionReset) {
            var updateSum = updates.length;
            var message = 'UpdateService: update {0} to version {1}.';

            if (commonService.isDefined(versionReset)) {
                data.version = versionReset;
            }
            if (commonService.isDefined(data.version)) {
                for (var i = data.version; i < updateSum; i++) {
                    data = updates[i](data);
                    data.version = i + 1;
                    loggerService.info(commonService.stringFormat(message, name, data.version), data);
                }
            } else {
                data.version = updateSum;
            }
            return data;
        };

        var updateOptions = function() {
            var updates = [
                function(options) {
                    if (commonService.isDefined(options.hoursPerDay)) {
                        options.timePerWeek = 0;

                        for (var i = 0, len = options.hoursPerDay.length; i < len; i++) {
                            options.timePerDay[i] = commonService.toMillisecond(0, 0, options.hoursPerDay[i]);
                            options.timePerWeek += options.timePerDay[i];
                        }
                    }
                    delete options.hoursPerDay;
                    delete options.hoursPerWeek;
                    return options;
                },
                function(options) {
                    if (commonService.isDefined(options.lockedTime)) {
                        options.activity = optionsDao.getDefaultOptions().activity;
                    }
                    delete options.lockedTime;
                    return options;
                }
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
