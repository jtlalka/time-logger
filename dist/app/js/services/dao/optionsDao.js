/**
 * Options Data Access Object
 */
angular.module('timeLogger')
    .service('optionsDao', function(storageService, commonService) {

        var syncManager = storageService.getSyncManager('options');

        var dataModel = {
            getDefaultOptions: function() {
                return {
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
                    timePerWeek: commonService.toMillisecond(0, 0, 40),
                    lockedTime: 0
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

        this.getTimePerDay = function(options, dateFormat) {
            return options.timePerDay[new Date(dateFormat).getDay()];
        };
    });
