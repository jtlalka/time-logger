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

            statusDao.getStatus().then(function(data) {
                var currentTime = args.currentTime;
                var currentType = setType(args.type, data.type);

                if (isFirstUpdate(data.startTime)) {
                    createStatusProxy(currentTime, currentType, callback);

                } else if (isNextDay(data.checkTime, currentTime)) {
                    data.checkTime = moveToEnd(data.checkTime, precisionTime);
                    currentTime = moveToStart(currentTime, precisionTime);

                    updateHistoryProxy(data.startTime, data.checkTime, data.type, true);
                    createStatusProxy(currentTime, currentType, callback);

                } else if (isNextTime(data.checkTime, currentTime, precisionTime)) {
                    updateHistoryProxy(data.startTime, data.checkTime, data.type, false);
                    createStatusProxy(currentTime, currentType, callback);

                    if (isLoggedTime(data.checkTime, currentTime, options.lockedTime)) {
                        updateHistoryProxy(data.checkTime, currentTime, self.type.LOCKED, false);
                    }

                } else if (isTypeChange(data.type, args.type)) {
                    if (isInPrecisionFrame(data.startTime, currentTime, precisionTime)) {
                        updateStatusProxy(data.startTime, currentTime, currentType, callback);
                    } else {
                        updateHistoryProxy(data.startTime, currentTime, data.type, false);
                        createStatusProxy(currentTime, currentType, callback);
                    }

                } else {
                    updateStatusProxy(data.startTime, currentTime, data.type, callback);
                }
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
            var date = commonService.moveToTime(checkTime, 0, 0, 0, 0);

            if (isInPrecisionFrame(checkTime, date.getTime(), precision)) {
                return date.getTime();
            } else {
                return checkTime;
            }
        };

        var moveToEnd = function(checkTime, precision) {
            var date = commonService.moveToTime(checkTime, 23, 59, 59, 0);

            if (isInPrecisionFrame(checkTime, date.getTime(), precision)) {
                return date.getTime();
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

        var createStatusProxy = function(currentTime, type, callback) {
            statusDao.createStatus(currentTime, defActive(type)).then(function(status) {
                loggerService.trace('DataService: create status.', status);
                callback();
            });
        };

        var updateStatusProxy = function(startTime, currentTime, type, callback) {
            statusDao.updateStatus(startTime, currentTime, defActive(type)).then(function(status) {
                loggerService.trace('DataService: update status.', status);
                callback();
            });
        };

        var updateHistoryProxy = function(startTime, currentTime, type, nextDay) {
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
                args.hoursPerDay = optionsDao.getHoursPerDay(data, args.status.startTime);

                commonService.copyProperty(data, options);
                updateTimelyHistory(args, callback);
            });
        };

        var updateTimelyHistory = function(args, callback) {
            historyDao.persistHistory(function(history) {
                return historyDao.updateHistoryStatus(history, args.status, args.hoursPerDay);
            }).then(function(history) {
                loggerService.info('DataService: update history.', history);
                callback();
            });
        };
    });
