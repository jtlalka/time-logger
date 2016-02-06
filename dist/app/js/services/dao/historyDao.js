/**
 * History Data Access Object
 */
angular.module('timeLogger')
    .service('historyDao', function(storageService, commonService) {

        var self = this;
        var localManager = storageService.getLocalManager('history');

        var dataModel = {
            getHistoryEntry: function() {
                return {
                    daily: {},
                    timeFrame: {
                        beginDate: null,
                        endDate: null,
                        overTime: 0
                    }
                };
            },
            getHistoryDailyEntry: function() {
                return {
                    active: true,
                    calculated: false,
                    overTime: 0,
                    types: {},
                    values: []
                };
            },
            getHistoryDailyValue: function(start, stop, type) {
                return {
                    start: start,
                    stop: stop,
                    type: type
                };
            }
        };

        this.getHistory = function() {
            return localManager.get(dataModel.getHistoryEntry());
        };

        this.updateHistory = function(history) {
            return localManager.set(history);
        };

        this.persistHistory = function(dataCallback) {
            return localManager.persist(dataModel.getHistoryEntry(), dataCallback);
        };

        this.isPresentDay = function(dateFormat) {
            return self.dateToInteger(dateFormat) === self.dateToInteger(Date.now());
        };

        this.isPastDay = function(dateFormat) {
            return self.dateToInteger(dateFormat) !== self.dateToInteger(Date.now());
        };

        this.dateToInteger = function(dateFormat) {
            var date = new Date(dateFormat);
            var yearValue = date.getFullYear() * 10000;
            var monthValue = (date.getMonth() + 1) * 100;
            var dayValue = date.getDate();

            return yearValue + monthValue + dayValue;
        };

        this.integerToDate = function(number) {
            var yearValue = Math.floor(number / 10000);
            var monthValue = Math.floor((number % 10000) / 100) - 1;
            var dayValue = number % 100;

            return new Date(yearValue, monthValue, dayValue);
        };

        this.getDeltaTime = function(startTime, stopTime) {
            return Math.max(0, stopTime - startTime || -1);
        };

        this.getDailyHistory = function(history, dateFormat) {
            var key = self.dateToInteger(dateFormat);

            if (history.daily[key]) {
                return history.daily[key];
            } else {
                return dataModel.getHistoryDailyEntry();
            }
        };

        this.getDailyOverTime = function(daily, timePerDay) {
            return self.getDailyWorkTime(daily.types) - timePerDay;
        };

        this.getDailyWorkTime = function(types) {
            var workTime = 0;
            for (var type in types) {
                if (types.hasOwnProperty(type)) {
                    workTime += types[type];
                }
            }
            return workTime;
        };

        this.filterTimeFrameDays = function(history) {
            var beginDate = history.timeFrame.beginDate;
            var endDate = history.timeFrame.endDate;
            var keyNumber = 0;

            for (var key in history.daily) {
                if (history.daily.hasOwnProperty(key)) {
                    keyNumber = parseInt(key, 10);

                    if (!keyIsInTimeFrame(keyNumber, beginDate, endDate)) {
                        delete history.daily[key];
                    }
                }
            }
            return history;
        };

        this.filterCalculatedDays = function(history) {
            for (var key in history.daily) {
                if (history.daily.hasOwnProperty(key) && !history.daily[key].calculated) {
                    delete history.daily[key];
                }
            }
            return history;
        };

        this.enableDayToHistory = function(history, key) {
            if (dayIsNotActive(history.daily[key])) {
                history.timeFrame = increaseTimeFrameOverTime(history.timeFrame, key, history.daily[key].overTime);
                history.daily[key].active = true;
            }
            return history;
        };

        this.disableDayFromHistory = function(history, key) {
            if (dayIsActive(history.daily[key])) {
                history.timeFrame = decreaseTimeFrameOverTime(history.timeFrame, key, history.daily[key].overTime);
                history.daily[key].active = false;
            }
            return history;
        };

        this.deleteDayFromHistory = function(history, key) {
            if (dayIsActive(history.daily[key])) {
                history.timeFrame = decreaseTimeFrameOverTime(history.timeFrame, key, history.daily[key].overTime);
            }
            delete history.daily[key];
            return history;
        };

        this.deleteDailyValue = function(history, key, index) {
            var value = history.daily[key].values[index];

            if (commonService.isDefined(value)) {
                var delta = self.getDeltaTime(value.start, value.stop);

                if (history.daily[key].calculated) {
                    history.daily[key].overTime -= delta;

                    if (dayIsActive(history.daily[key])) {
                        history.timeFrame = decreaseTimeFrameOverTime(history.timeFrame, key, delta);
                    }
                }
                history.daily[key].types[value.type] -= delta;
                history.daily[key].values.splice(index, 1);
            }
            return history;
        };

        var dayIsActive = function(day) {
            return commonService.isTrue(day.active);
        };

        var dayIsNotActive = function(day) {
            return commonService.isFalse(day.active);
        };

        this.updateHistoryStatus = function(history, status, timePerDay) {
            return updateHistoryData(history, status.startTime, status.checkTime, status.type, timePerDay);
        };

        var updateHistoryData = function(history, start, stop, type, timePerDay) {
            var key = self.dateToInteger(start);
            var delta = self.getDeltaTime(start, stop);

            if (commonService.isUndefined(history.daily[key])) {
                history.daily[key] = dataModel.getHistoryDailyEntry();
            }

            updateHistoryTypes(history, key, type, delta);
            updateHistoryDailyValue(history, key, start, stop, type);
            updateHistoryOverTime(history, key, timePerDay);

            return history;
        };

        var updateHistoryTypes = function(history, key, type, delta) {
            if (history.daily[key].types[type]) {
                history.daily[key].types[type] += delta;
            } else {
                history.daily[key].types[type] = delta;
            }
        };

        var updateHistoryDailyValue = function(history, key, start, stop, type) {
            var newStatus = dataModel.getHistoryDailyValue(start, stop, type);
            var lastStatus = history.daily[key].values.slice(-1).pop();

            if (lastStatus && lastStatus.type === newStatus.type && lastStatus.stop === newStatus.start) {
                lastStatus.stop = newStatus.stop;
            } else {
                history.daily[key].values.push(newStatus);
            }
        };

        var updateHistoryOverTime = function(history, key, timePerDay) {
            if (commonService.isDefined(timePerDay)) {
                var oldOverTime = history.daily[key].overTime;
                var newOverTime = self.getDailyOverTime(history.daily[key], timePerDay);

                if (dayIsActive(history.daily[key]) && oldOverTime !== newOverTime) {
                    history.timeFrame = decreaseTimeFrameOverTime(history.timeFrame, key, oldOverTime);
                    history.timeFrame = increaseTimeFrameOverTime(history.timeFrame, key, newOverTime);
                }
                history.daily[key].overTime = newOverTime;
                history.daily[key].calculated = true;
            }
        };

        var increaseTimeFrameOverTime = function(timeFrame, key, overTime) {
            if (keyIsInTimeFrame(key, timeFrame.beginDate, timeFrame.endDate)) {
                timeFrame.overTime += overTime;
            }
            return timeFrame;
        };

        var decreaseTimeFrameOverTime = function(timeFrame, key, overTime) {
            if (keyIsInTimeFrame(key, timeFrame.beginDate, timeFrame.endDate)) {
                timeFrame.overTime -= overTime;
            }
            return timeFrame;
        };

        var keyIsInTimeFrame = function(key, beginDate, endDate) {
            return !(beginDate && beginDate > key) && !(endDate && endDate < key);
        };

        this.updateTimeFrameHistory = function(history, beginDate, endDate) {
            var overTime = 0;
            var keyNumber = 0;

            for (var key in history.daily) {
                if (history.daily.hasOwnProperty(key) && dayIsActive(history.daily[key])) {
                    keyNumber = parseInt(key, 10);

                    if (keyIsInTimeFrame(keyNumber, beginDate, endDate)) {
                        overTime += history.daily[key].overTime;
                    }
                }
            }

            history.timeFrame.beginDate = beginDate;
            history.timeFrame.endDate = endDate;
            history.timeFrame.overTime = overTime;
            return history;
        };
    });
