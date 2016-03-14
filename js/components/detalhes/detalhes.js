angular.module('estudos').controller('DetalhesController', ['$scope', '$rootScope', '$state', '$stateParams', 'Assuntos',
    function($scope, $rootScope, $state, $stateParams, Assuntos){
        $scope.initDet = function () {
            waitingDialog.show();
            Assuntos.getById($stateParams.materia).then(function (materia) {
                $scope.assunto = materia.materias[$stateParams.indice];
                waitingDialog.hide();
            });
        };
    }]);