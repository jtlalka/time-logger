/**
 * View Service
 */
angular.module('timeLogger')
    .service('viewService', function($q, loggerService, commonService, optionsDao, historyDao, statusDao) {

        this.options = {};
        this.history = {};
        this.daily = {};

        this.currentDate = null;
        this.hoursPerDay = 0;
        this.timePerDay = 0;

        var self = this;
        var promises = {};

        this.ready = function() {
            return promises.service;
        };

        this.refresh = function() {
            self.currentDate = new Date();

            promises.options = optionsDao.getOptions();
            promises.history = historyDao.getHistory();
            promises.status = statusDao.getStatus();
            promises.service = $q.all([promises.options, promises.history, promises.status]);

            return promises.service.then(function(data) {
                refreshOptionsDara(data[0]);
                refreshHistoryData(data[1], data[2]);
            });
        };

        var refreshOptionsDara = function(options) {
            self.options = options;
            self.hoursPerDay = optionsDao.getHoursPerDay(options, self.currentDate);
            self.timePerDay = commonService.toMillisecond(0, 0, self.hoursPerDay);
        };

        var refreshHistoryData = function(history, status) {
            self.history = historyDao.updateHistoryStatus(history, status, self.hoursPerDay);
            self.daily = historyDao.getDailyHistory(history, self.currentDate);
        };

        this.optionsUpdate = function(options) {
            return optionsDao.updateOptions(options).then(function() {
                self.refresh();
            });
        };

        this.clearHistory = function() {
            return historyDao.removeHistory().then(function() {
                self.refresh();
            });
        };

        this.clearStatus = function() {
            return statusDao.removeStatus().then(function() {
                self.refresh();
            });
        };

        self.refresh();
    });
