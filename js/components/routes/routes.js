angular.module('estudos').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "views/home/home.html",
            controller: 'HomeController'
        })
        .state('detalhes', {
            url: "/detalhes",
            templateUrl: "views/detalhes/detalhes.html",
            controller: 'DetalhesController'
        });
});