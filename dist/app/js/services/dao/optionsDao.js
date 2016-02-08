/**
 * Options Data Access Object
 */
angular.module('timeLogger')
    .service('optionsDao', function(storageService, commonService) {

        var syncManager = storageService.getSyncManager('options');

        var dataModel = {
            getDefaultOptions: function() {
                return {
                    activity: {
                        active: {
                            type: 'active',
                            status: true,
                            maxTime: commonService.toMillisecond(0, 0, 12)
                        },
                        idle: {
                            type: 'idle',
                            status: true,
                            maxTime: commonService.toMillisecond(0, 0, 2)
                        },
                        locked: {
                            type: 'locked',
                            status: true,
                            maxTime: commonService.toMillisecond(0, 0, 2)
                        }
                    },
                    notifications: false,
                    timePerDay: [
                        commonService.toMillisecond(0),
                        commonService.toMillisecond(0, 0, 8),
                        commonService.toMillisecond(0, 0, 8),
                        commonService.toMillisecond(0, 0, 8),
                        commonService.toMillisecond(0, 0, 8),
                        commonService.toMillisecond(0, 0, 8),
                        commonService.toMillisecond(0)
                    ],
                    timePerWeek: commonService.toMillisecond(0, 0, 40)
                };
            }
        };

        this.getOptions = function() {
            return syncManager.get(dataModel.getDefaultOptions());
        };

        this.updateOptions = function(options) {
            return syncManager.set(options);
        };

        this.persistOptions = function(dataCallback) {
            return syncManager.persist(dataModel.getDefaultOptions(), dataCallback);
        };

        this.getActivityByType = function(options, type) {
            for (var key in options.activity) {
                if (options.activity.hasOwnProperty(key)) {
                    var activity = options.activity[key];

                    if (activity.type === type) {
                        return options.activity[key];
                    }
                }
            }
            return null;
        };

        this.getTimePerDay = function(options, dateFormat) {
            return options.timePerDay[new Date(dateFormat).getDay()];
        };

        this.getTimeOptions = function() {
            var times = [];
            var minTime = commonService.toMillisecond(0);
            var maxTime = commonService.toMillisecond(0, 0, 12);
            var stepTime = commonService.toMillisecond(0, 15);

            for (var i = minTime; i <= maxTime; i += stepTime) {
                times.push(i);
            }
            return times;
        };

        this.getDefaultOptions = function() {
            return dataModel.getDefaultOptions();
        };
    });
