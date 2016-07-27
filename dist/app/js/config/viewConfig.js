/**
 * Angular View module for timeTable application.
 */
angular.module('timeLogger', ['ngRoute']);


/**
 * Angular router for timeTable application.
 */
angular.module('timeLogger')
    .config(function($routeProvider) {
        $routeProvider
            .when('/tooltip', {
                title: 'ToolTip',
                templateUrl: 'partials/tooltip.html',
                controller: 'tooltipController'
            })
            .when('/history', {
                title: 'History',
                templateUrl: 'partials/history.html',
                controller: 'historyController'
            })
            .when('/options', {
                title: 'Options',
                templateUrl: 'partials/options.html',
                controller: 'optionsController'
            });
    })
    .constant('routerConfig', {
        tooltip: 'tooltip',
        history: 'history',
        options: 'options'
    });
