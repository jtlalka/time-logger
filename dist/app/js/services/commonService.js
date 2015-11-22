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
                    callFunction: func,
                    callArguments: args
                });
                if (!inProgress) {
                    triggerFunction();
                }
            };

            var triggerFunction = function() {
                inProgress = true;
                var item = callStack.shift();

                item.callFunction(item.callArguments, function() {
                    if (callStack.length > 0) {
                        triggerFunction();
                    } else {
                        inProgress = false;
                    }
                });
            };
        }

        var getSyncStack = function(func) {
            return new SyncStack(func);
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
            copyProperty: copyProperty
        };
    });
