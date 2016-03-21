angular.module('estudos').controller('AssuntosController', ['$scope', '$rootScope', '$state', 'Assuntos',
    function ($scope, $rootScope, $state, Assuntos) {
        $scope.assuntosInit = function () {
            waitingDialog.show();

            Assuntos.all({sort: {"assunto": 1}}).then(function (assuntos) {
                $scope.materiasUnificadas = assuntos;
                waitingDialog.hide();
            });

        };

        $scope.editar = function (assunto) {

        };

        $scope.excluir = function (assunto) {

        };
    }]);