/**
 * Storage Service
 */
angular.module('timeLogger')
    .service('dataService', function(propertyService, loggerService, commonService, optionsDao, historyDao, statusDao) {

        var self = this;
        var options = null;

        var statusStack = commonService.getSyncStack();
        var historyStack = commonService.getSyncStack();
        var precisionTime = propertyService.getPrecisionTime();

        this.type = {
            ACTIVE: 'active',
            IDLE: 'idle',
            LOCKED: 'locked'
        };

        this.checkStatus = function(type) {
            if (options === null) {
                statusStack.push(firstChecksAction, getCheckStatusArgs(type));
            } else {
                statusStack.push(checkStatusAction, getCheckStatusArgs(type));
            }
        };

        var getCheckStatusArgs = function(type) {
            return {
                currentTime: Date.now(),
                type: type
            };
        };

        var firstChecksAction = function(args, callback) {
            options = {};
            optionsDao.getOptions().then(function(data) {
                commonService.copyProperty(data, options);
                checkStatusAction(args, callback);
            });
        };

        var checkStatusAction = function(args, callback) {

            statusDao.persistStatus(function(data) {
                var currentTime = args.currentTime;
                var currentType = setType(args.type, data.type);
                var status = angular.copy(data);

                if (isFirstUpdate(data.startTime)) {
                    createStatus(status, currentTime, currentType);

                } else if (isNextDay(data.checkTime, currentTime)) {
                    data.checkTime = moveToEnd(data.checkTime, precisionTime);
                    currentTime = moveToStart(currentTime, precisionTime);

                    updateHistory(data.startTime, data.checkTime, data.type, true);
                    createStatus(status, currentTime, currentType);

                } else if (isNextTime(data.checkTime, currentTime, precisionTime)) {
                    updateHistory(data.startTime, data.checkTime, data.type, false);
                    if (isLoggedTime(data.checkTime, currentTime, options.lockedTime)) {
                        updateHistory(data.checkTime, currentTime, self.type.LOCKED, false);
                    }
                    createStatus(status, currentTime, currentType);

                } else if (isTypeChange(data.type, args.type)) {
                    if (isInPrecisionFrame(data.startTime, currentTime, precisionTime)) {
                        updateStatus(status, data.startTime, currentTime, currentType);
                    } else {
                        updateHistory(data.startTime, currentTime, data.type, false);
                        createStatus(status, currentTime, currentType);
                    }

                } else {
                    updateStatus(status, data.startTime, currentTime, data.type);
                }
                return status;

            }).then(function(status) {
                loggerService.trace('DataService: update status.', status);
                callback();
            });
        };

        var isFirstUpdate = function(startTime) {
            return commonService.isUndefined(startTime);
        };

        var isNextDay = function(checkTime, currentTime) {
            return historyDao.dateToInteger(checkTime) !== historyDao.dateToInteger(currentTime);
        };

        var isNextTime = function(checkTime, currentTime, deltaTime) {
            return Math.abs(currentTime - checkTime) > deltaTime;
        };

        var isLoggedTime = function(checkTime, currentTime, maxLoggedTime) {
            return Math.abs(currentTime - checkTime) < maxLoggedTime;
        };

        var isTypeChange = function(oldType, newType) {
            return newType && newType !== oldType;
        };

        var moveToStart = function(checkTime, precision) {
            var newTime = commonService.moveToTime(checkTime, 0, 0, 0, 0);

            if (isInPrecisionFrame(checkTime, newTime, precision)) {
                return newTime;
            } else {
                return checkTime;
            }
        };

        var moveToEnd = function(checkTime, precision) {
            var newTime = commonService.moveToTime(checkTime, 23, 59, 59, 0);

            if (isInPrecisionFrame(checkTime, newTime, precision)) {
                return newTime;
            } else {
                return checkTime;
            }
        };

        var isInPrecisionFrame = function(value1, value2, precision) {
            return Math.abs(value1 - value2) < precision;
        };

        var defActive = function(type) {
            return setType(type, self.type.ACTIVE);
        };

        var setType = function(type, defType) {
            return type ? type : defType;
        };

        var createStatus = function(status, currentTime, type) {
            status.startTime = currentTime;
            status.checkTime = currentTime;
            status.type = defActive(type);
            return status;
        };

        var updateStatus = function(status, startTime, currentTime, type) {
            status.startTime = startTime;
            status.checkTime = currentTime;
            status.type = defActive(type);
            return status;
        };

        var updateHistory = function(startTime, currentTime, type, nextDay) {
            historyStack.push(updateHistoryAction, {
                status: statusDao.getStatusObject(startTime, currentTime, type),
                nextDay: nextDay
            });
        };

        var updateHistoryAction = function(args, callback) {
            if (commonService.isTrue(args.nextDay)) {
                updateDailyHistory(args, callback);
            } else {
                updateTimelyHistory(args, callback);
            }
        };

        var updateDailyHistory = function(args, callback) {
            optionsDao.getOptions().then(function(data) {
                args.dailyUpdate = true;
                args.timePerDay = optionsDao.getTimePerDay(data, args.status.startTime);

                commonService.copyProperty(data, options);
                updateTimelyHistory(args, callback);
            });
        };

        var updateTimelyHistory = function(args, callback) {
            historyDao.persistHistory(function(history) {
                return historyDao.updateHistoryStatus(history, args.status, args.timePerDay);
            }).then(function(history) {
                loggerService.info('DataService: update history.', history);
                callback();
            });
        };
    });
