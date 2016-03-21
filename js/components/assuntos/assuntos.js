angular.module('estudos').controller('AssuntosController', ['$scope', '$rootScope', '$state', 'Assuntos', '$modal',
    function ($scope, $rootScope, $state, Assuntos, $modal) {
        $scope.assuntosInit = function () {
            waitingDialog.show();

            Assuntos.all({sort: {"assunto": 1}}).then(function (assuntos) {
                $scope.materiasUnificadas = assuntos;
                waitingDialog.hide();
            });
        };

        $scope.editar = function (assunto) {
            $state.go('assunto',{id: assunto._id.$oid});
        };

        $scope.excluir = function (assunto) {
            $modal
                .open({
                    templateUrl: 'exclusao.html',
                    controller: function ($scope) {
                        $scope.cancelarExclusao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarExclusao = function () {
                            assunto.$remove().then(function () {
                                $scope.$close(true);
                            });
                        };
                    }
                }).result.then(function () {
                    $state.reload();
                }, function () {

                });
        };

        $scope.criarAssunto = function () {
            $modal
                .open({
                    templateUrl: 'criar-assunto.html',
                    controller: function ($scope, assuntosDB) {

                        $scope.initCriar = function () {
                            $scope.assunto = new assuntosDB();
                            $scope.assunto.assunto = "";
                            $scope.assunto.geral = {
                                "total": 0,
                                "acertos": 0,
                                "aproveitamento": 0
                            };
                            $scope.assunto.materias = [];
                            $scope.assunto.status = "";
                            $scope.assunto.qtdMaterias = 0;
                            $scope.assunto.arrayStatus = [100, 0, 0, 0];
                        };

                        $scope.cancelarCriacao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarCriacao = function () {
                            if($scope.assunto.assunto) {
                                $scope.assunto.$saveOrUpdate().then(function () {
                                    $scope.$close(true);
                                });
                            }
                        };
                    },
                    resolve: {
                        assuntosDB: function () {
                            return Assuntos;
                        }
                    }
                }).result.then(function () {
                    $state.reload();
                }, function () {});
        };
    }]);