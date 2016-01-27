/**
 * Chrome Event Service
 */
angular.module('timeLogger')
    .service('eventService', function($interval, dataService, updateService, propertyService, loggerService) {

        var detectionTime = propertyService.getDetectionTime();
        var intervalTime = propertyService.getIntervalTime();
        var intervalFunc = null;

        this.initChromeEvents = function() {
            onStartApplication();
            onStateChangedEvent();
        };

        var onStartApplication = function() {
            loggerService.trace('EventService: onStart event.');
            updateService.checkUpdates().then(function() {
                dataService.checkStatus(dataService.type.ACTIVE);
                startStatusChecker();
            });
        };

        var onStateChangedEvent = function() {
            if (chrome.idle.setDetectionInterval) {
                chrome.idle.setDetectionInterval(detectionTime);
            }
            chrome.idle.onStateChanged.addListener(function(idleState) {
                loggerService.trace('EventService: onStateChanged event.');
                dataService.checkStatus(idleState);
                resetStatusChecker();
            });
        };

        var startStatusChecker = function() {
            if (intervalFunc === null) {
                intervalFunc = $interval(function() {
                    dataService.checkStatus();
                }, intervalTime, 0, false);
            }
        };

        var stopStatusChecker = function() {
            if (intervalFunc !== null) {
                $interval.cancel(intervalFunc);
                intervalFunc = null;
            }
        };

        var resetStatusChecker = function() {
            stopStatusChecker();
            startStatusChecker();
        };
    });
