/**
 * Order Object By property filter.
 */
angular.module('timeLogger')
    .filter('orderObjectBy', function() {
        return function(items, field, reverse) {
            var filtered = [];

            for (var key in items) {
                if (items.hasOwnProperty(key)) {
                    filtered.push(items[key]);
                }
            }
            filtered.sort(function (a, b) {
                if (reverse) {
                    return (b[field] > a[field] ? 1 : -1);
                } else {
                    return (b[field] < a[field] ? 1 : -1);
                }
            });
            return filtered;
        };
    });
