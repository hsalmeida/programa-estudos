angular.module('estudos')
    .factory('Assuntos',function($mongolabResourceHttp){
        return $mongolabResourceHttp('assuntos');
    });