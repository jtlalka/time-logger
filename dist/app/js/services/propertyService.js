/**
 * Property Service
 */
angular.module('timeLogger')
    .service('propertyService', function(commonService) {

        var defValues = Object.freeze({
            intervalTime: commonService.toMillisecond(30),
            precisionTime: commonService.toMillisecond(90),
            detectionTime: commonService.toMillisecond(0, 5),
            dbVersion: 0,
            loggerLevel: 3,
            loggerParse: 'false'
        });

        this.getIntervalTime = function() {
            return getNumber('intervalTime');
        };

        this.getPrecisionTime = function() {
            return getNumber('precisionTime');
        };

        this.getDetectionTime = function() {
            return getSeconds('detectionTime');
        };

        this.getDbVersion = function() {
            return getNumber('dbVersion');
        };

        this.getLoggerLevel = function() {
            return getNumber('loggerLevel');
        };

        this.getLoggerParse = function() {
            return getBoolean('loggerParse');
        };

        var getBoolean = function(key) {
            return commonService.isTrue(getString(key));
        };

        var getSeconds = function(key) {
            return commonService.toSeconds(getNumber(key));
        };

        var getString = function(key) {
            return localStorage[key] ? localStorage[key] : defValues[key];
        };

        var getNumber = function(key) {
            return localStorage[key] ? parseInt(localStorage[key], 10) : defValues[key];
        };
    });
