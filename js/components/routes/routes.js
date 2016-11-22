angular.module('estudos').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('login', {
            url: "/",
            templateUrl: "views/login/login.html",
            controller: 'LoginController',
            data: {
                requiredlogin: false
            }
        })
        .state('home', {
            url: "/home",
            templateUrl: "views/home/home.html",
            controller: 'HomeController',
            data: {
                requiredlogin: true
            }

        })
        .state('detalhes', {
            url: "/detalhes/:materia/:indice",
            templateUrl: "views/detalhes/detalhes.html",
            controller: 'DetalhesController',
            data: {
                requiredlogin: true
            }
        })
        .state('calendario', {
            url: "/calendario",
            templateUrl: "views/calendario/calendario.html",
            controller: 'CalendarioController',
            data: {
                requiredlogin: true
            }
        })
        .state('calendario2', {
            url: "/calendario2",
            templateUrl: "views/calendario/calendario2.html",
            controller: 'Calendario2Controller',
            data: {
                requiredlogin: true
            }
        })
        .state('chartevo', {
            url: "/chart",
            templateUrl: "views/chart/chart.html",
            controller: 'ChartController',
            data: {
                requiredlogin: true
            }
        })
        .state('chartdes', {
            url: "/chartdes",
            templateUrl: "views/chart/chartdes.html",
            controller: 'ChartDesController',
            data: {
                requiredlogin: true
            }
        })
        .state('assuntos', {
            url: "/assuntos",
            templateUrl: "views/assuntos/assuntos.html",
            controller: 'AssuntosController',
            data: {
                requiredlogin: true
            }
        })
        .state('assunto', {
            url: "/assunto/:id",
            templateUrl: "views/assuntos/assunto.html",
            controller: 'AssuntoController',
            data: {
                requiredlogin: true
            }
        });
});