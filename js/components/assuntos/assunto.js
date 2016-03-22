angular.module('estudos').controller('AssuntoController', ['$scope', '$rootScope', '$state', '$stateParams', 'Assuntos',
    '$modal',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $modal) {
        $scope.assuntoInit = function () {
            waitingDialog.show();

            Assuntos.getById($stateParams.id).then(function (assunto) {
                $scope.assunto = assunto;
                waitingDialog.hide();
            });

        };

        $scope.editar = function (materia, indice) {
            $modal
                .open({
                    templateUrl: 'editar.html',
                    controller: function ($scope, parentScope, indiceMateria, materiaSelecionada) {
                        $scope.initEditar = function () {
                            $scope.materia = materiaSelecionada;
                        };
                        $scope.confirmarEditar = function () {
                            if($scope.materia.texto && $scope.materia.concurso) {
                                parentScope.assunto.materias[indiceMateria] = $scope.materia;
                                $scope.$close(true);
                            }
                        };
                        $scope.cancelarEditar = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        },
                        materiaSelecionada: function () {
                            return materia;
                        },
                        indiceMateria: function () {
                            return indice;
                        }
                    }
                }).result.then(function () {
                    $scope.assunto.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };

        $scope.excluir = function (indice) {
            $modal
                .open({
                    templateUrl: 'exclusao.html',
                    controller: function ($scope) {
                        $scope.cancelarExclusao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarExclusao = function () {
                            $scope.$close(true);
                        };
                    }
                }).result.then(function () {
                    $scope.assunto.materias.splice(indice, 1);
                    $scope.assunto.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };

        $scope.salvar = function () {
            if($scope.assunto.assunto) {
                $scope.assunto.$saveOrUpdate().then(function () {
                    $state.reload();
                });
            }
        };

        $scope.criarMateria = function () {
            $modal
                .open({
                    templateUrl: 'criar-materia.html',
                    controller: function ($scope, parentScope) {
                        $scope.initCriar = function () {
                            $scope.materia = {
                                "texto" : "",
                                "concurso": "",
                                "topico": parentScope.assunto.assunto,
                                "geral": {
                                    "total": 0,
                                    "acertos": 0,
                                    "aproveitamento": 0
                                },
                                "datas": [],
                                "qtdDatas": 0,
                                "status": "",
                                "arrayStatus": [
                                    100,
                                    0,
                                    0,
                                    0
                                ]
                            };
                        };

                        $scope.cancelarCriacao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarCriacao = function () {
                            if($scope.materia.texto && $scope.materia.concurso) {
                                parentScope.assunto.materias.push($scope.materia);
                                $scope.$close(true);
                            }
                        };
                    },
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        }
                    }
                }).result.then(function () {
                    $scope.assunto.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };

    }]);