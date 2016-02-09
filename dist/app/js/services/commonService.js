/**
 * Common Service
 */
angular.module('timeLogger')
    .factory('commonService', function() {

        function SyncStack() {
            var callStack = [];
            var inProgress = false;

            this.push = function(func, args) {
                callStack.push({
                    func: func,
                    args: args
                });
                if (!inProgress) {
                    triggerFunction();
                }
            };

            var triggerFunction = function() {
                inProgress = true;
                var item = callStack.shift();

                item.func(item.args, function() {
                    if (callStack.length > 0) {
                        triggerFunction();
                    } else {
                        inProgress = false;
                    }
                });
            };
        }

        var getSyncStack = function() {
            return new SyncStack();
        };

        var isTrue = function(value) {
            return value === true || value === 'true';
        };

        var isFalse = function(value) {
            return !isTrue(value);
        };

        var isNumber = function(value) {
            return typeof value === 'number' && isFinite(value);
        };

        var isInteger = function(value) {
            return isNumber(value) && Math.floor(value) === value;
        };

        var isDefined = function(object) {
            return object !== null && object !== undefined;
        };

        var isUndefined = function(object) {
            return object === null || object === undefined;
        };

        var toSeconds = function(millisecond) {
            return Math.round(millisecond / 1000);
        };

        var toMillisecond = function(seconds, minutes, hours, days, weeks) {
            var result = 0;
            var vector = 1;

            var calculate = function(time, vectorValue) {
                if (isDefined(time)) {
                    vector *= vectorValue;
                    result += vector * time;
                }
            };
            calculate(seconds, 1000);
            calculate(minutes, 60);
            calculate(hours, 60);
            calculate(days, 24);
            calculate(weeks, 7);
            return result;
        };

        var toUTCDate = function(dateFormat) {
            var local = new Date(dateFormat);

            return new Date(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(),
                local.getUTCHours(), local.getUTCMinutes(), local.getUTCSeconds());
        };

        var dateToTime = function(timeFormat) {
            var date = new Date(timeFormat);
            return toMillisecond(date.getSeconds(), date.getMinutes(), date.getHours());
        };

        var moveToTime = function(timeFormat, hours, minutes, seconds, milliseconds) {
            var date = new Date(timeFormat);
            date.setHours(hours, minutes, seconds, milliseconds);
            return date.getTime();
        };

        var copyProperty = function(objectFrom, objectTo) {
            if (isUndefined(objectTo)) {
                objectTo = {};
            }
            for (var prop in objectFrom) {
                if (objectFrom.hasOwnProperty(prop)) {
                    objectTo[prop] = objectFrom[prop];
                }
            }
        };

        var toArray = function(objectFrom, arrayTo) {
            if (!Array.isArray(arrayTo)) {
                arrayTo = [];
            }
            for (var key in objectFrom) {
                if (objectFrom.hasOwnProperty(key)) {
                    arrayTo.push(objectFrom[key]);
                }
            }
            return arrayTo;
        };

        var arraySort = function(array, property, reverse) {
            if (isUndefined(array) || isUndefined(property)) {
                return array;
            }
            var positive = reverse ? -1 : 1;
            var negative = reverse ? 1 : -1;

            var mapped = array.map(function(item, intex) {
                return {index: intex, value: item};
            });
            mapped.sort(function (a, b) {
                if (a.value[property] === b.value[property]) {
                    return a.index > b.index ? positive : negative;
                } else {
                    return a.value[property] > b.value[property] ? positive : negative;
                }
            });
            return mapped.map(function(element){
                return array[element.index];
            });
        };

        var arrayReduce = function(array, property, value) {
            if (isUndefined(array) || isUndefined(property)) {
                return array;
            }
            return array.filter(function(item) {
                return item[property] && item[property] === value;
            });
        };

        var stringFormat = function(format) {
            for (var i = 1, len = arguments.length; i < len; i++) {
                format = format.replace(new RegExp('\\{' + (i - 1) + '\\}', 'gi'), arguments[i]);
            }
            return format;
        };

        var getNumbersArray = function(nim, max, step) {
            for (var numbers = [], i = nim; i <= max; i += step) {
                numbers.push(i);
            }
            return numbers;
        };

        return {
            getSyncStack: getSyncStack,
            isTrue: isTrue,
            isFalse: isFalse,
            isNumber: isNumber,
            isInteger: isInteger,
            isDefined: isDefined,
            isUndefined: isUndefined,
            toSeconds: toSeconds,
            toMillisecond: toMillisecond,
            toUTCDate: toUTCDate,
            dateToTime: dateToTime,
            moveToTime: moveToTime,
            copyProperty: copyProperty,
            toArray: toArray,
            arraySort: arraySort,
            arrayReduce: arrayReduce,
            stringFormat: stringFormat,
            getNumbersArray: getNumbersArray
        };
    });
