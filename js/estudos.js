angular.module("estudos", [
    'ui.router', 'ngResource', 'mongolabResourceHttp', 'mwl.calendar',
    'ngCookies', 'ngAnimate', 'ui.bootstrap'
])
    .constant('MONGOLAB_CONFIG', {API_KEY: 'YXgR-q92vuVCKlSm-ji3nplDTE7rHIQh', DB_NAME: 'ltdb'})
    .config(function (calendarConfig) {
        calendarConfig.dateFormatter = 'moment';
    });