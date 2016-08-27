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
                if ($scope.assunto.qtdDatas > 0) {
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

                            $scope.tempos = [
                                "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00",
                                "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
                                "11:00", "11:30", "12:00"
                            ];

                            $scope.Math = window.Math;
                            $scope.estudo = {
                                total: dataSelecionada.total,
                                acerto: dataSelecionada.acerto,
                                data: new Date(dataSelecionada.data),
                                tempo: dataSelecionada.tempo,
                                observacao: dataSelecionada.observacao,
                                status: dataSelecionada.status ? dataSelecionada.status : "incompleto",
                                relevante: dataSelecionada.relevante ? dataSelecionada.relevante : false
                            };
                            dataSelecionada.data = new Date(dataSelecionada.data);
                        };

                        function formValido() {
                            $scope.dataError = "";
                            $scope.tempoError = "";
                            var valido = true;
                            if (!$scope.estudo.data) {
                                valido = false;
                                $scope.dataError = "Data do estudo é obrigatória";
                            }

                            if ($scope.estudo.tempo === "00:00") {
                                valido = false;
                                $scope.tempoError = "Tempo de estudo é obrigatório";
                            }

                            return valido;
                        }

                        $scope.confirmarEditar = function () {

                            if (formValido()) {

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

                            parentScope.materiaMae.materias[indiceMateria].datas.splice(indice, 1);

                            if ($scope.relevante) {
                                //refazer para saber quando mudou o aproveitamento.

                                parentScope.materiaMae.materias[indiceMateria].geral.totalAcertos = 0;
                                parentScope.materiaMae.materias[indiceMateria].geral.totalGeral = 0;
                                if (parentScope.materiaMae.materias[indiceMateria].datas.length > 0) {
                                    var maiorAproveitamento = 0;
                                    var maiorAcerto = 0;
                                    var maiortotal = 0;
                                    for (var a = 0; a < parentScope.materiaMae.materias[indiceMateria].datas.length; a++) {
                                        var tempAproveitamento = 0;
                                        if (parentScope.materiaMae.materias[indiceMateria].datas[a].total !== 0) {

                                            parentScope.materiaMae.materias[indiceMateria].geral.totalAcertos += parentScope.materiaMae.materias[indiceMateria].datas[a].acerto;
                                            parentScope.materiaMae.materias[indiceMateria].geral.totalGeral += parentScope.materiaMae.materias[indiceMateria].datas[a].total;

                                            tempAproveitamento = Math.round((parentScope.materiaMae.materias[indiceMateria].datas[a].acerto
                                                / parentScope.materiaMae.materias[indiceMateria].datas[a].total) * 100);
                                            if (tempAproveitamento >= maiorAproveitamento) {
                                                maiorAproveitamento = tempAproveitamento;
                                                maiorAcerto = parentScope.materiaMae.materias[indiceMateria].datas[a].acerto;
                                                maiortotal = parentScope.materiaMae.materias[indiceMateria].datas[a].total;
                                            }
                                        }
                                    }
                                    parentScope.materiaMae.materias[indiceMateria].geral.aproveitamento = maiorAproveitamento;
                                    parentScope.materiaMae.materias[indiceMateria].geral.acertos = maiorAcerto;
                                    parentScope.materiaMae.materias[indiceMateria].geral.total = maiortotal;
                                }

                                var acerto = 0;
                                var total = 0;

                                for(var i = 0; i < parentScope.materiaMae.materias.length; i++) {
                                    acerto += parentScope.materiaMae.materias[i].geral.totalAcertos;
                                    total += parentScope.materiaMae.materias[i].geral.totalGeral;
                                }

                                parentScope.materiaMae.geral.acertos = acerto;
                                parentScope.materiaMae.geral.total = total;
                                parentScope.materiaMae.geral.aproveitamento = total !== 0 ? Math.round((acerto / total) * 100) : 0;

                                /*
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
                                 */
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
                    //$scope.materiaMae.materias[$stateParams.indice].datas.splice(indice, 1);
                    $scope.materiaMae.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };
    }]);