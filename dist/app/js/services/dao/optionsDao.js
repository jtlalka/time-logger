/**
 * Options Data Access Object
 */
angular.module('timeLogger')
    .service('optionsDao', function(storageService) {

        var syncManager = storageService.getSyncManager('options');

        var dataModel = {
            getDefaultOptions: function() {
                return {
                    hoursPerWeek: 40,
                    hoursPerDay: [0, 8, 8, 8, 8, 8, 0],
                    lockedTime: 0,
                    notifications: false
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

        this.getHoursPerDay = function(options, dateFormat) {
            return options.hoursPerDay[new Date(dateFormat).getDay()];
        };
    });
