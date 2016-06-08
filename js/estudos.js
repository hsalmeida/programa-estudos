angular.module("estudos", [
    'ui.router', 'ngResource', 'mongolabResourceHttp', 'mwl.calendar',
    'ngCookies', 'ngAnimate', 'ui.bootstrap', 'chart.js', 'dndLists'
])
    .constant('MONGOLAB_CONFIG', {API_KEY: 'YXgR-q92vuVCKlSm-ji3nplDTE7rHIQh', DB_NAME: 'ltdb'})
    .config(function (calendarConfig) {
        calendarConfig.dateFormatter = 'moment';
    });

/**
 * metodo para verificar diferencas entre dois objetos,
 * @param obj1 objeto1
 * @param obj2 objeto2
 * @param attrs lista em string dos atributos a serem testados
 * @returns {boolean} true quando há diferença.
 */
function checkDiffs(obj1, obj2, attrs) {
    var hasDif = false;

    for (var i = 0; i < attrs.length; i++) {
        if (obj1[attrs[i]] instanceof Date && obj2[attrs[i]] instanceof Date) {
            if (obj1[attrs[i]].getTime() !== obj2[attrs[i]].getTime()) {
                hasDif = true;
                break;
            }
        } else {
            if (obj1[attrs[i]] !== obj2[attrs[i]]) {
                hasDif = true;
                break;
            }
        }
    }
    return hasDif;
}