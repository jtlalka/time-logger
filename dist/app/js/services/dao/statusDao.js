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

        this.createStatus = function(startTime, type) {
            return localManager.set(dataModel.getStatusEntry(startTime, startTime, type));
        };

        this.updateStatus = function(startTime, checkTime, type) {
            return localManager.set(dataModel.getStatusEntry(startTime, checkTime, type));
        };

        this.removeStatus = function() {
            return localManager.remove();
        };

        this.getStatusObject = function(startTime, checkTime, type) {
            return dataModel.getStatusEntry(startTime, checkTime, type);
        };
    });
