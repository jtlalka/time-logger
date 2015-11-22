/**
 * Storage Service
 */
angular.module('timeLogger')
    .service('storageService', function($q) {

        var syncFactory = {};
        var localFactory = {};

        function SyncManager(name) {
            var dbTable = name;

            this.get = function(object) {
                return $q(function(resolve) {
                    chrome.storage.sync.get(convertToStorageObject(dbTable, object), function(data) {
                        resolve(getObjectFromStorage(data, dbTable, object));
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
        }

        function LocalManager(name) {
            var dbTable = name;

            this.get = function(object) {
                return $q(function(resolve) {
                    chrome.storage.local.get(convertToStorageObject(dbTable, object), function(data) {
                        resolve(getObjectFromStorage(data, dbTable, object));
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

        var getObjectFromStorage = function(object, property, defaultObject) {
            if (object && object[property]) {
                return object[property];
            } else {
                return defaultObject;
            }
        };
    });
