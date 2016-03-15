angular.module('estudos').controller('DetalhesController', ['$scope', '$rootScope', '$state', '$stateParams', 'Assuntos',
    '$modal',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $modal) {
        $scope.relevante = true;
        $scope.initDet = function () {
            waitingDialog.show();
            Assuntos.getById($stateParams.materia).then(function (materia) {
                $scope.materiaMae = materia;
                $scope.assunto = materia.materias[$stateParams.indice];
                $scope.assunto.status = "";
                $scope.assunto.qtdDatas = $scope.assunto.datas.length;
                var arrayStatus = [0,0,0,0];
                angular.forEach($scope.assunto.datas, function (data, dataIndex) {
                    data.status === "incompleto" ?
                        arrayStatus[1]++ : data.status === "revisar" ?
                        arrayStatus[2]++ : data.status === "completo" ?
                        arrayStatus[3]++ : arrayStatus[0]++;
                });
                for(var i = 0; i < arrayStatus.length; i++) {
                    arrayStatus[i] = Math.floor((arrayStatus[i] / $scope.assunto.qtdDatas) * 100);
                }
                $scope.assunto.status = arrayStatus[3] === 100 ? "completo" :
                    arrayStatus[2] === 100 ? "revisar" :
                    arrayStatus[1] === 100 ? "incompleto" : "";
                $scope.assunto.arrayStatus = arrayStatus;
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
                        $scope.confirmarEditar = function () {
                            //separo o orginal para testes.
                            var dataOriginal = parentScope.materiaMae.materias[indiceMateria].datas[indiceData];
                            //atualizo no objeto o aproveitamento.
                            $scope.estudo.aproveitamento = Math.floor(($scope.estudo.acerto / $scope.estudo.total) * 100);
                            //verifico se houve modificações do original para o novo
                            var dif = checkDiffs($scope.estudo, dataOriginal,
                                ['total','acerto','data','tempo','observacao','status','relevante']);

                            if(dif) {
                                if($scope.estudo.relevante) {
                                    //atualizo o valor da materia.
                                    var geralMateria = parentScope.materiaMae.materias[indiceMateria].geral;
                                    geralMateria.acertos = (geralMateria.acertos - dataOriginal.acerto) + $scope.estudo.acerto;
                                    geralMateria.total = (geralMateria.total - dataOriginal.total) + $scope.estudo.total;
                                    geralMateria.aproveitamento = Math.floor((geralMateria.acertos / geralMateria.total) * 100);
                                    parentScope.materiaMae.materias[indiceMateria].geral = geralMateria;
                                    //atualizo o valor do assunto.
                                    var geralMae = parentScope.materiaMae.geral;
                                    geralMae.acertos = (geralMae.acertos - dataOriginal.acerto) + $scope.estudo.acerto;
                                    geralMae.total = (geralMae.total - dataOriginal.total) + $scope.estudo.total;
                                    geralMae.aproveitamento = Math.floor((geralMae.acertos / geralMae.total) * 100);
                                    parentScope.materiaMae.geral = geralMae;
                                }
                                parentScope.materiaMae.materias[indiceMateria].datas[indiceData] = $scope.estudo;
                                $scope.$close(true);
                            } else {
                                $scope.$dismiss();
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
                        parentScope: function () {
                            return $scope;
                        }
                    }
                }).result.then(function () {
                    if ($scope.relevante) {

                    }
                    $scope.materiaMae.materias[$stateParams.indice].datas.splice(indice, 1);
                    $scope.materiaMae.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };
    }]);