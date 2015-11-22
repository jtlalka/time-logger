/**
 * Angular Server module for timeTable application.
 */
angular.module('timeLogger', []);


/**
 * Angular run timeTable application server.
 */
angular.module('timeLogger').run(function(eventService) {
    eventService.initChromeEvents();
    eventService.initIntervalEvents();
});


/**
 * Add virtual ng-app to HTML document.
 */
angular.element(document).ready(function() {
    angular.bootstrap(document, ['timeLogger']);
});
