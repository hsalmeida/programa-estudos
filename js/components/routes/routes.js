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
        .state('charts', {
            url: "/chart",
            templateUrl: "views/chart/chart.html",
            controller: 'ChartController'
        });
});