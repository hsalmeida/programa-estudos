angular.module("estudos", [
    'ui.router', 'ngResource', 'mongolabResourceHttp', 'mwl.calendar',
    'ngCookies', 'ngAnimate', 'ui.bootstrap', 'chart.js', 'dndLists',
    'colorpicker.module', 'ui.calendar', 'angularMoment'
])
    .constant('MONGOLAB_CONFIG', {API_KEY: 'YXgR-q92vuVCKlSm-ji3nplDTE7rHIQh', DB_NAME: 'ltdb'})
    .config(function (calendarConfig) {
        calendarConfig.dateFormatter = 'moment';
        calendarConfig.allDateFormats.moment.title.week = 'Semana {week} de {year}';
        calendarConfig.dateFormats.hour = 'HH:mm';
        calendarConfig.allDateFormats.moment.date.datetime = 'DD MMM, HH:mm';
    }).filter('index', function () {
        return function (array, index) {
            if (!index)
                index = 'index';
            for (var i = 0; i < array.length; ++i) {
                array[i][index] = i;
            }
            return array;
        };
    })
    .run(function ($rootScope, $state, $window) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            var requireLogin = toState.data.requiredlogin;
            var currentUser = angular.fromJson($window.sessionStorage.getItem('programaEstudosUsuarioLogado'));
            if (requireLogin && typeof currentUser === 'undefined') {
                event.preventDefault();
                $state.go('login');
            } else {
                $rootScope.usuarioLogado = currentUser;
            }
        });
        $rootScope.$on("logout", function(){
            logout();
        });

        function logout () {
            $window.sessionStorage.removeItem('programaEstudosUsuarioLogado');
            $rootScope.usuarioLogado = null;
            $state.go('login');
        }
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

if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('js/service-worker.js')
        .then(function() { });
}