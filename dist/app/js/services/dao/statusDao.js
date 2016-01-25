/**
 * Status Data Access Object
 */
angular.module('timeLogger')
    .service('statusDao', function(storageService) {

        var localManager = storageService.getLocalManager('status');

        var dataModel = {
            getStatusEntry: function(startTime, checkTime, type) {
                return {
                    startTime: startTime,
                    checkTime: checkTime,
                    type: type
                };
            }
        };

        this.getStatus = function() {
            return localManager.get(dataModel.getStatusEntry(null, null, null));
        };

        this.persistStatus = function(dataCallback) {
            return localManager.persist(dataModel.getStatusEntry(null, null, null), dataCallback);
        };

        this.getStatusObject = function(startTime, checkTime, type) {
            return dataModel.getStatusEntry(startTime, checkTime, type);
        };
    });
