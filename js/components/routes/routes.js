angular.module('estudos').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "views/home/home.html",
            controller: 'HomeController'
        })
        .state('detalhes', {
            url: "/detalhes/:materia/:indice",
            templateUrl: "views/detalhes/detalhes.html",
            controller: 'DetalhesController'
        })
        .state('calendario', {
            url: "/calendario",
            templateUrl: "views/calendario/calendario.html",
            controller: 'CalendarioController'
        })
        .state('calendario2', {
            url: "/calendario2",
            templateUrl: "views/calendario/calendario2.html",
            controller: 'Calendario2Controller'
        })
        .state('chartevo', {
            url: "/chart",
            templateUrl: "views/chart/chart.html",
            controller: 'ChartController'
        })
        .state('chartdes', {
            url: "/chartdes",
            templateUrl: "views/chart/chartdes.html",
            controller: 'ChartDesController'
        })
        .state('assuntos', {
            url: "/assuntos",
            templateUrl: "views/assuntos/assuntos.html",
            controller: 'AssuntosController'
        })
        .state('assunto', {
            url: "/assunto/:id",
            templateUrl: "views/assuntos/assunto.html",
            controller: 'AssuntoController'
        });
});