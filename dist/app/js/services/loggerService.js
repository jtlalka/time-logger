/**
 * Logger Service
 */
angular.module('timeLogger')
    .service('loggerService', function($filter, storageService) {

        var KEY_LEVEL = 'logger.level';
        var LOG_LEVER = storageService.local.getInt(KEY_LEVEL, 2);

        var LEVEL = {
            ERROR: {name: 'ERROR', value: 3},
            WARN: {name: 'WARN', value: 2},
            INFO: {name: 'INFO', value: 1},
            TRACE: {name: 'TRACE', value: 0}
        };

        this.error = function(message, object) {
            log(LEVEL.ERROR, message, object);
        };

        this.warn = function(message, object) {
            log(LEVEL.WARN, message, object);
        };

        this.info = function(message, object) {
            log(LEVEL.INFO, message, object);
        };

        this.trace = function(message, object) {
            log(LEVEL.TRACE, message, object);
        };

        var log = function(LEVEL, message, object) {
            if (LEVEL.value < LOG_LEVER) {
                return;
            }
            if (object) {
                console.info(getDateTime() + getLevel(LEVEL), message, object);
            } else {
                console.info(getDateTime() + getLevel(LEVEL), message);
            }
        };

        var getLevel = function(LEVEL) {
            return ' [' + LEVEL.name + '] ';
        };

        var getDateTime = function() {
            return $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm:ss');
        };
    });
