/**
 * Transform Object to Array.
 */
angular.module('timeLogger')
    .filter('toArray', function(commonService) {
        return function(object) {
            return commonService.toArray(object);
        };
    });


/**
 * Sort by object which contains property and reverse flag.
 */
angular.module('timeLogger')
    .filter('sortBy', function(commonService) {
        return function(array, order) {
            return commonService.arraySort(array, order.property, order.reverse);
        };
    });


/**
 * Reduce by object which contains property and key.
 */
angular.module('timeLogger')
    .filter('reduceBy', function(commonService) {
        return function(array, reduce) {
            return commonService.arrayReduce(array, reduce.property, reduce.value);
        };
    });
