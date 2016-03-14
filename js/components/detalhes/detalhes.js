angular.module('estudos').controller('DetalhesController', ['$scope', '$rootScope', '$state', '$stateParams', 'Assuntos',
    '$modal',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $modal) {
        $scope.relevante = true;
        $scope.initDet = function () {
            waitingDialog.show();
            Assuntos.getById($stateParams.materia).then(function (materia) {
                $scope.materiaMae = materia;
                $scope.assunto = materia.materias[$stateParams.indice];
                waitingDialog.hide();
            });
        };

        $scope.excluir = function (indice) {
            $modal
                .open({
                    templateUrl: 'confirmarExclusao.html',
                    controller: function ($scope, parentScope) {
                        $scope.relevante = true;
                        $scope.cancelarExclusao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarExclusao = function () {
                            parentScope.relevante = $scope.relevante;
                            $scope.$close(true);
                        };
                    },
                    resolve: {
                        parentScope: function(){
                            return $scope;
                        }
                    }
                }).result.then(function () {
                    if($scope.relevante) {

                    }
                    $scope.materiaMae.materias[$stateParams.indice].datas.splice(indice, 1);
                    $scope.materiaMae.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };
    }]);