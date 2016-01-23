/**
 * Storage Service
 */
angular.module('timeLogger')
    .service('storageService', function($q) {

        var syncFactory = {};
        var localFactory = {};

        function SyncManager(name) {

            var self = this;
            var dbTable = name;

            this.get = function(defaultObject) {
                return $q(function(resolve) {
                    chrome.storage.sync.get(convertToStorageObject(dbTable, defaultObject), function(data) {
                        resolve(getObjectFromStorage(data, dbTable, defaultObject));
                    });
                });
            };

            this.set = function(object) {
                return $q(function(resolve) {
                    chrome.storage.sync.set(convertToStorageObject(dbTable, object), function() {
                        resolve(object);
                    });
                });
            };

            this.remove = function() {
                return $q(function(resolve) {
                    chrome.storage.sync.remove(dbTable, function() {
                        resolve();
                    });
                });
            };

            this.persist = function(defaultObject, dataCallback) {
                return self.get(defaultObject).then(function(data) {
                    return self.set(dataCallback(data));
                });
            };
        }

        function LocalManager(name) {

            var self = this;
            var dbTable = name;

            this.get = function(defaultObject) {
                return $q(function(resolve) {
                    chrome.storage.local.get(convertToStorageObject(dbTable, defaultObject), function(data) {
                        resolve(getObjectFromStorage(data, dbTable, defaultObject));
                    });
                });
            };

            this.set = function(object) {
                return $q(function(resolve) {
                    chrome.storage.local.set(convertToStorageObject(dbTable, object), function() {
                        resolve(object);
                    });
                });
            };

            this.remove = function() {
                return $q(function(resolve) {
                    chrome.storage.local.remove(dbTable, function() {
                        resolve();
                    });
                });
            };

            this.persist = function(defaultObject, dataCallback) {
                return self.get(defaultObject).then(function(data) {
                    return self.set(dataCallback(data));
                });
            };
        }

        this.getSyncManager = function(name) {
            if (isUndefined(syncFactory[name])) {
                syncFactory[name] = new SyncManager(name);
            }
            return syncFactory[name];
        };

        this.getLocalManager = function(name) {
            if (isUndefined(localFactory[name])) {
                localFactory[name] = new LocalManager(name);
            }
            return localFactory[name];
        };

        var isUndefined = function(object) {
            return object === undefined;
        };

        var convertToStorageObject = function(key, object) {
            var storageObject = {};
            storageObject[key] = object;
            return storageObject;
        };

        var getObjectFromStorage = function(storageObject, key, defaultObject) {
            if (storageObject && storageObject[key] !== undefined) {
                return storageObject[key];
            } else {
                return defaultObject;
            }
        };
    });
