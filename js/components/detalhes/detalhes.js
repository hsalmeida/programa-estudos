angular.module('estudos').controller('DetalhesController', ['$scope', '$rootScope', '$state', '$stateParams', 'Assuntos',
    '$modal',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $modal) {
        $scope.relevante = true;
        $scope.initDet = function () {
            waitingDialog.show("Aguarde. Carregando detalhes");
            Assuntos.getById($stateParams.materia).then(function (materia) {
                $scope.materiaMae = materia;
                $scope.assunto = materia.materias[$stateParams.indice];
                $scope.assunto.status = "";
                $scope.assunto.qtdDatas = $scope.assunto.datas.length;

                var ultimoStatus = "";
                if($scope.assunto.qtdDatas > 0) {
                    ultimoStatus = $scope.assunto.datas[($scope.assunto.qtdDatas - 1)].status;
                }
                $scope.assunto.status = ultimoStatus;
                waitingDialog.hide();
            });
        };

        $scope.editar = function (indice, data) {
            $modal
                .open({
                    templateUrl: 'editarData.html',
                    controller: function ($scope, parentScope, indiceData, indiceMateria, dataSelecionada) {
                        $scope.initEditar = function () {
                            $scope.Math = window.Math;
                            $scope.estudo = {
                                total: dataSelecionada.total,
                                acerto: dataSelecionada.acerto,
                                data: new Date(dataSelecionada.data),
                                tempo: new Date(dataSelecionada.tempo),
                                observacao: dataSelecionada.observacao,
                                status: dataSelecionada.status ? dataSelecionada.status : "incompleto",
                                relevante: dataSelecionada.relevante ? dataSelecionada.relevante : false
                            };
                            dataSelecionada.data = new Date(dataSelecionada.data);
                            dataSelecionada.tempo = new Date(dataSelecionada.tempo);
                        };

                        function formValido() {
                            $scope.dataError = "";
                            $scope.tempoError = "";
                            var valido = true;
                            if(!$scope.estudo.data) {
                                valido = false;
                                $scope.dataError = "Data do estudo é obrigatória";
                            }

                            if(!$scope.estudo.tempo) {
                                valido = false;
                                $scope.tempoError = "Tempo de estudo é obrigatório";
                            }

                            return valido;
                        }

                        $scope.confirmarEditar = function () {

                            if(formValido()) {

                                //separo o orginal para testes.
                                var dataOriginal = parentScope.materiaMae.materias[indiceMateria].datas[indiceData];
                                //atualizo no objeto o aproveitamento.
                                $scope.estudo.aproveitamento = 0;
                                if ($scope.estudo.total !== 0) {
                                    $scope.estudo.aproveitamento = Math.floor(($scope.estudo.acerto / $scope.estudo.total) * 100);
                                }
                                //verifico se houve modificações do original para o novo
                                var dif = checkDiffs($scope.estudo, dataOriginal,
                                    ['total', 'acerto', 'data', 'tempo', 'observacao', 'status', 'relevante']);

                                if (dif) {
                                    if ($scope.estudo.relevante) {
                                        //atualizo o valor da materia.
                                        var geralMateria = parentScope.materiaMae.materias[indiceMateria].geral;
                                        geralMateria.acertos = (geralMateria.acertos - dataOriginal.acerto) + $scope.estudo.acerto;
                                        geralMateria.total = (geralMateria.total - dataOriginal.total) + $scope.estudo.total;
                                        geralMateria.aproveitamento = 0;
                                        if (geralMateria.total !== 0) {
                                            geralMateria.aproveitamento = Math.floor((geralMateria.acertos / geralMateria.total) * 100);
                                        }
                                        parentScope.materiaMae.materias[indiceMateria].geral = geralMateria;
                                        //atualizo o valor do assunto.
                                        var geralMae = parentScope.materiaMae.geral;
                                        geralMae.acertos = (geralMae.acertos - dataOriginal.acerto) + $scope.estudo.acerto;
                                        geralMae.total = (geralMae.total - dataOriginal.total) + $scope.estudo.total;
                                        geralMae.aproveitamento = 0;
                                        if (geralMae.total !== 0) {
                                            geralMae.aproveitamento = Math.floor((geralMae.acertos / geralMae.total) * 100);
                                        }
                                        parentScope.materiaMae.geral = geralMae;
                                    }
                                    parentScope.materiaMae.materias[indiceMateria].datas[indiceData] = $scope.estudo;
                                    $scope.$close(true);
                                } else {
                                    $scope.$dismiss();
                                }
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
                        indiceData: function () {
                            return indice;
                        },
                        dataSelecionada: function () {
                            return data;
                        },
                        indiceMateria: function () {
                            return $stateParams.indice;
                        }
                    }
                }).result.then(function () {
                    $scope.materiaMae.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };

        $scope.excluir = function (indice) {
            $modal
                .open({
                    templateUrl: 'confirmarExclusao.html',
                    controller: function ($scope, parentScope, indiceMateria) {
                        $scope.relevante = true;
                        $scope.cancelarExclusao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarExclusao = function () {
                            parentScope.relevante = $scope.relevante;
                            if($scope.relevante) {
                                //atualizo o valor da materia.
                                var geralMateria = parentScope.materiaMae.materias[indiceMateria].geral;
                                geralMateria.acertos = (geralMateria.acertos - parentScope.materiaMae.materias[indiceMateria].datas[indice].acerto);
                                geralMateria.total = (geralMateria.total - parentScope.materiaMae.materias[indiceMateria].datas[indice].total);
                                geralMateria.aproveitamento = 0;
                                if(geralMateria.total !== 0) {
                                    geralMateria.aproveitamento = Math.floor((geralMateria.acertos / geralMateria.total) * 100);
                                }
                                parentScope.materiaMae.materias[indiceMateria].geral = geralMateria;
                                //atualizo o valor do assunto.
                                var geralMae = parentScope.materiaMae.geral;
                                geralMae.acertos = (geralMae.acertos - parentScope.materiaMae.materias[indiceMateria].datas[indice].acerto);
                                geralMae.total = (geralMae.total - parentScope.materiaMae.materias[indiceMateria].datas[indice].total);
                                geralMae.aproveitamento = 0;
                                if(geralMae.total !== 0) {
                                    geralMae.aproveitamento = Math.floor((geralMae.acertos / geralMae.total) * 100);
                                }
                                parentScope.materiaMae.geral = geralMae;
                            }

                            $scope.$close(true);
                        };
                    },
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        },
                        indiceMateria: function () {
                            return $stateParams.indice;
                        }
                    }
                }).result.then(function () {
                    $scope.materiaMae.materias[$stateParams.indice].datas.splice(indice, 1);
                    $scope.materiaMae.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };
    }]);