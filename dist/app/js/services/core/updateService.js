/**
 * Chrome Event Service
 */
angular.module('timeLogger')
    .service('updateService', function($q, storageService, propertyService, loggerService, commonService,
            optionsDao, historyDao, statusDao) {

        this.checkUpdates = function(callback) {
            var versionManager = storageService.getLocalManager('dbVersion');
            var currentVersion = propertyService.getDbVersion();

            versionManager.persist(currentVersion, function(previousVersion) {
                if (currentVersion > previousVersion) {
                    updateDataSource(previousVersion, currentVersion).then(callback);
                } else {
                    callback();
                }
                return currentVersion;
            });
        };

        var updateDataSource = function(previousVersion, currentVersion) {
            var optionsPromise = updateOptions(previousVersion, currentVersion);
            var historyPromise = updateHistory(previousVersion, currentVersion);
            var statusPromise = updateStatus(previousVersion, currentVersion);

            return $q.all([optionsPromise, historyPromise, statusPromise]);
        };

        var triggerUpdates = function(updates, data, previousVersion, currentVersion) {
            var keyNumber = 0;
            for (var key in updates) {
                if (updates.hasOwnProperty(key)) {
                    keyNumber = parseInt(key, 10);

                    if (keyNumber > previousVersion && keyNumber <= currentVersion) {
                        data = updates[key](data);
                        loggerService.trace('UpdateService: updates object to version: ' + key, data);
                    }
                }
            }
            return data;
        };

        var updateOptions = function(previousVersion, currentVersion) {
            var updates = {
            };

            return optionsDao.persistOptions(function(data) {
                return triggerUpdates(updates, data, previousVersion, currentVersion);
            });
        };

        var updateHistory = function(previousVersion, currentVersion) {
            var updates = {
            };

            return historyDao.persistHistory(function(data) {
                return triggerUpdates(updates, data, previousVersion, currentVersion);
            });
        };

        var updateStatus = function(previousVersion, currentVersion) {
            var updates = {
            };

            return statusDao.persistStatus(function(data) {
                return triggerUpdates(updates, data, previousVersion, currentVersion);
            });
        };
    });
