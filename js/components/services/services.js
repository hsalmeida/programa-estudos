angular.module('estudos')
    .factory('Assuntos',function($mongolabResourceHttp){
        return $mongolabResourceHttp('assuntos');
    })
    .factory('Usuario',function($mongolabResourceHttp){
        return $mongolabResourceHttp('usuario');
    });
