/**
 * Chrome Event Service
 */
angular.module('timeLogger')
    .service('eventService', function($interval, dataService, updateService, propertyService, loggerService) {

        var detectionTime = propertyService.getDetectionTime();
        var intervalTime = propertyService.getIntervalTime();
        var intervalFunc = null;

        this.initChromeEvents = function() {
            onInstalledEvent();
            onStartEvent();
            onStopEvent();
            onStateChangedEvent();
        };

        var onInstalledEvent = function() {
            chrome.runtime.onInstalled.addListener(function() {
                loggerService.trace('EventService: onInstalled event.');
                updateService.checkUpdates(function() {
                    dataService.checkStatus(dataService.type.ACTIVE);
                    startCheckStatusLoop();
                });
            });
        };

        var onStartEvent = function() {
            chrome.runtime.onStartup.addListener(function() {
                loggerService.trace('EventService: onStartup event.');
                dataService.checkStatus(dataService.type.ACTIVE);
                startCheckStatusLoop();
            });
        };

        var onStopEvent = function() {
            chrome.runtime.onSuspend.addListener(function() {
                loggerService.trace('EventService: onSuspend event.');
                dataService.checkStatus(dataService.type.LOCKED);
                stopCheckStatusLoop();
            });
        };

        var onStateChangedEvent = function() {
            if (chrome.idle.setDetectionInterval) {
                chrome.idle.setDetectionInterval(detectionTime);
            }
            chrome.idle.onStateChanged.addListener(function(idleState) {
                loggerService.trace('EventService: onStateChanged event.');
                dataService.checkStatus(idleState);
                resetCheckStatusLoop();
            });
        };

        var startCheckStatusLoop = function() {
            if (intervalFunc === null) {
                intervalFunc = $interval(function() {
                    dataService.checkStatus();
                }, intervalTime, 0, false);
            }
        };

        var stopCheckStatusLoop = function() {
            if (intervalFunc !== null) {
                $interval.cancel(intervalFunc);
                intervalFunc = null;
            }
        };

        var resetCheckStatusLoop = function() {
            stopCheckStatusLoop();
            startCheckStatusLoop();
        };
    });
