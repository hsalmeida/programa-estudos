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
                requiredlogin: true,
                tituloPagina: "Detalhes"
            }
        })
        .state('calendario', {
            url: "/calendario",
            templateUrl: "views/calendario/calendario.html",
            controller: 'CalendarioController',
            data: {
                requiredlogin: true,
                tituloPagina: "Calendário"
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
                requiredlogin: true,
                tituloPagina: "Gráfico de Evolução"
            }
        })
        .state('chartdes', {
            url: "/chartdes",
            templateUrl: "views/chart/chartdes.html",
            controller: 'ChartDesController',
            data: {
                requiredlogin: true,
                tituloPagina: "Gráfico de Desempenho"
            }
        })
        .state('assuntos', {
            url: "/assuntos",
            templateUrl: "views/assuntos/assuntos.html",
            controller: 'AssuntosController',
            data: {
                requiredlogin: true,
                tituloPagina: "Editar Assuntos"
            }
        })
        .state('assunto', {
            url: "/assunto/:id",
            templateUrl: "views/assuntos/assunto.html",
            controller: 'AssuntoController',
            data: {
                requiredlogin: true,
                tituloPagina: "Editar Assunto"
            }
        })
        .state('ciclo', {
            url: "/ciclo-estudo",
            templateUrl: "views/chart/ciclo-estudo.html",
            controller: 'CicloEstudoController',
            data: {
                requiredlogin: true,
                tituloPagina: "Ciclo de Estudo"
            }
        });
});