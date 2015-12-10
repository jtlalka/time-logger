/**
 * Chrome Event Service
 */
angular.module('timeLogger')
    .service('updateService', function($q, storageService, loggerService, optionsDao, historyDao, statusDao) {

        var versionManager = storageService.getLocalManager('dbVersion');
        var currentVersion = storageService.local.get('core.dbVersion', 1);

        this.checkUpdates = function(callback) {
            versionManager.persist(currentVersion, function(version) {
                if (currentVersion === version) {
                    loggerService.info('UpdateService: no updates.');
                    callback();
                } else {
                    loggerService.info('UpdateService: update to version: ' + currentVersion);
                    updateDataStored(version).then(callback);
                }
                return currentVersion;
            });
        };

        var updateDataStored = function(version) {
            var optionsPromise = updateOptions(version);
            var historyPromise = updateHistory(version);
            var statusPromise = updateStatus(version);

            return $q.all([optionsPromise, historyPromise, statusPromise]);
        };

        var updateOptions = function(version) {
            return optionsDao.persistOptions(function(data) {
                switch (version) {
                    case 1:
                }
                loggerService.trace('UpdateService: options updates.', data);
                return data;
            });
        };

        var updateHistory = function(version) {
            return historyDao.persistHistory(function(data) {
                switch (version) {
                    case 1:
                }
                loggerService.trace('UpdateService: history updates.', data);
                return data;
            });
        };

        var updateStatus = function(version) {
            return statusDao.persistStatus(function(data) {
                switch (version) {
                    case 1:
                }
                loggerService.trace('UpdateService: status updates.', data);
                return data;
            });
        };
    });
