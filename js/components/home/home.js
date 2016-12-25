angular.module('estudos').controller('HomeController', ['$scope', '$rootScope', '$state', '$cookies', '$http', '$filter', '$modal',
    'Assuntos',
    function ($scope, $rootScope, $state, $cookies, $http, $filter, $modal, Assuntos) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        /*
         status:
         padrao "em aberto"
         quando inicia um estudo "incompleto"
         na edição pode escolher "revisar" ou "completo"
         * */
        $scope.setselectedrow = function (index) {
            if ($scope.selectedrow === index) {
                $scope.selectedrow = -1;
            } else {
                $scope.selectedrow = index;
            }
        };

        $scope.searchtext = "";
        $scope.array = [];

        $scope.subsearchFunc = function (item) {
            return (!$scope.searchtext ||
            item.texto.toLowerCase().indexOf($scope.searchtext.toLowerCase()) !== -1 ||
            item.concurso.toLowerCase().indexOf($scope.searchtext.toLowerCase()) !== -1);
        };

        $scope.searchFunc = function (item) {
            return (
            !$scope.searchtext ||
            item.assunto.toLowerCase().indexOf($scope.searchtext.toLowerCase()) !== -1 ||
            ($filter('filter')(item.materias, {texto: $scope.searchtext})).length > 0 ||
            ($filter('filter')(item.materias, {concurso: $scope.searchtext})).length > 0);
        };

        $scope.verDetalhes = function (materia, assunto) {
            var assuntoIndice = materia.materias.indexOf(assunto);
            var materiaId = materia._id.$oid;
            $state.go('detalhes', {materia: materiaId, indice: assuntoIndice});
        };

        /*
         funcao para criar atributo chamado ativo e deixar todos em true.
         */
        $scope.criarAtivo = function () {
            for (var z = 0; z < $scope.materiasUnificadas.length; z++) {
                var lenMaterias = $scope.materiasUnificadas[z].materias.length;
                $scope.materiasUnificadas[z].ativo = true;
                for (var j = 0; j < lenMaterias; j++) {
                    $scope.materiasUnificadas[z].materias[j].ativo = true;
                }
                $scope.materiasUnificadas[z].$saveOrUpdate().then(function (materia) {
                    console.log("atualizado: " + materia.assunto);
                });
            }
        };

        $scope.ajustarStatus = function () {
            for (var z = 0; z < $scope.materiasUnificadas.length; z++) {

                var lenMaterias = $scope.materiasUnificadas[z].materias.length;
                for (var j = 0; j < lenMaterias; j++) {

                    $scope.materiasUnificadas[z].materias[j].qtdDatas =
                        $scope.materiasUnificadas[z].materias[j].datas.length;

                    var ultimoStatus = "";
                    if ($scope.materiasUnificadas[z].materias[j].qtdDatas > 0) {
                        ultimoStatus = $scope.materiasUnificadas[z].materias[j].datas[($scope.materiasUnificadas[z].materias[j].qtdDatas - 1)].status;
                    } else {
                        ultimoStatus = "";
                    }
                    $scope.materiasUnificadas[z].materias[j].status = ultimoStatus;
                }

                $scope.materiasUnificadas[z].$saveOrUpdate().then(function (materia) {
                    console.log("salvo: " + materia.assunto);
                });
            }
        };

        /*
         recalcula todas as materias
         */
        $scope.recalcular = function () {
            for (var z = 0; z < $scope.materiasUnificadas.length; z++) {
                var acerto = 0;
                var total = 0;
                var lenMaterias = $scope.materiasUnificadas[z].materias.length;
                for (var j = 0; j < lenMaterias; j++) {
                    $scope.materiasUnificadas[z].materias[j].geral.totalAcertos = 0;
                    $scope.materiasUnificadas[z].materias[j].geral.totalGeral = 0;
                    if ($scope.materiasUnificadas[z].materias[j].datas.length > 0) {
                        var maiorAproveitamento = 0;
                        var maiorAcerto = 0;
                        var maiortotal = 0;
                        for (var a = 0; a < $scope.materiasUnificadas[z].materias[j].datas.length; a++) {
                            var tempAproveitamento = 0;
                            if ($scope.materiasUnificadas[z].materias[j].datas[a].total !== 0) {

                                $scope.materiasUnificadas[z].materias[j].geral.totalAcertos += $scope.materiasUnificadas[z].materias[j].datas[a].acerto;
                                $scope.materiasUnificadas[z].materias[j].geral.totalGeral += $scope.materiasUnificadas[z].materias[j].datas[a].total;

                                tempAproveitamento = Math.round(($scope.materiasUnificadas[z].materias[j].datas[a].acerto
                                    / $scope.materiasUnificadas[z].materias[j].datas[a].total) * 100);
                                if (tempAproveitamento >= maiorAproveitamento) {
                                    maiorAproveitamento = tempAproveitamento;
                                    maiorAcerto = $scope.materiasUnificadas[z].materias[j].datas[a].acerto;
                                    maiortotal = $scope.materiasUnificadas[z].materias[j].datas[a].total;
                                }
                            }
                        }
                        $scope.materiasUnificadas[z].materias[j].geral.aproveitamento = maiorAproveitamento;
                        $scope.materiasUnificadas[z].materias[j].geral.acertos = maiorAcerto;
                        $scope.materiasUnificadas[z].materias[j].geral.total = maiortotal;
                    }
                    acerto += $scope.materiasUnificadas[z].materias[j].geral.totalAcertos;
                    total += $scope.materiasUnificadas[z].materias[j].geral.totalGeral;
                }
                $scope.materiasUnificadas[z].geral.acertos = acerto;
                $scope.materiasUnificadas[z].geral.total = total;
                $scope.materiasUnificadas[z].geral.aproveitamento = total !== 0 ? Math.round((acerto / total) * 100) : 0;
                $scope.materiasUnificadas[z].$saveOrUpdate().then(function (materia) {
                    console.log("salvo: " + materia.assunto);
                });
            }
        };

        $scope.initHome = function () {

            waitingDialog.show("Aguarde. Carregando assuntos");
            var ativos = {
                "ativo": true,
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            Assuntos.query(ativos, {sort: {"assunto": 1}}).then(function (assuntos) {
                $scope.materiasUnificadas = assuntos;
                for (var z = 0; z < $scope.materiasUnificadas.length; z++) {
                    //var materiasFilter = $filter('filter')($scope.materiasUnificadas[z].materias, {"ativo": true}, true);
                    $scope.materiasUnificadas[z].status = $scope.materiasUnificadas[z].status ?
                        $scope.materiasUnificadas[z].status : '';
                    var arrayStatusMateriaMae = [0, 0, 0, 0];
                    $scope.materiasUnificadas[z].qtdMaterias = 0;

                    for (var j = 0; j < $scope.materiasUnificadas[z].materias.length; j++) {

                        if(!$scope.materiasUnificadas[z].materias[j].listaordem) {
                            $scope.materiasUnificadas[z].materias[j].listaordem = (j + 1);
                        }

                        $scope.materiasUnificadas[z].materias[j].qtdDatas =
                            $scope.materiasUnificadas[z].materias[j].datas.length;

                        var ultimoStatus = "";
                        if ($scope.materiasUnificadas[z].materias[j].qtdDatas > 0) {
                            ultimoStatus = $scope.materiasUnificadas[z].materias[j].datas[($scope.materiasUnificadas[z].materias[j].qtdDatas - 1)].status;
                        } else {
                            ultimoStatus = "";
                        }
                        /*
                         for (var a = 0; a < $scope.materiasUnificadas[z].materias[j].datas.length; a++) {

                         $scope.materiasUnificadas[z].materias[j].datas[a].status === "incompleto" ?
                         arrayStatus[1]++ : $scope.materiasUnificadas[z].materias[j].datas[a].status === "revisar" ?
                         arrayStatus[2]++ : $scope.materiasUnificadas[z].materias[j].datas[a].status === "completo" ?
                         arrayStatus[3]++ : arrayStatus[0]++;
                         }
                         for (var i = 0; i < arrayStatus.length; i++) {
                         if ($scope.materiasUnificadas[z].materias[j].qtdDatas > 0) {
                         arrayStatus[i] = Math.floor((arrayStatus[i] / $scope.materiasUnificadas[z].materias[j].qtdDatas) * 100);
                         }
                         }
                         if ($scope.materiasUnificadas[z].materias[j].qtdDatas === 0) {
                         arrayStatus[0] = 100;
                         }
                         */

                        $scope.materiasUnificadas[z].materias[j].status = ultimoStatus;

                        if($scope.materiasUnificadas[z].materias[j].ativo) {
                            $scope.materiasUnificadas[z].materias[j].status === "incompleto" ?
                                arrayStatusMateriaMae[1]++ : $scope.materiasUnificadas[z].materias[j].status === "revisar" ?
                                arrayStatusMateriaMae[2]++ : $scope.materiasUnificadas[z].materias[j].status === "completo" ?
                                arrayStatusMateriaMae[3]++ : arrayStatusMateriaMae[0]++;
                            $scope.materiasUnificadas[z].qtdMaterias++;
                        }
                    }

                    for (var b = 0; b < arrayStatusMateriaMae.length; b++) {
                        if ($scope.materiasUnificadas[z].qtdMaterias > 0) {
                            arrayStatusMateriaMae[b] =
                                Math.round((arrayStatusMateriaMae[b] / $scope.materiasUnificadas[z].qtdMaterias) * 100);
                        }
                    }

                    $scope.materiasUnificadas[z].status = arrayStatusMateriaMae[3] === 100 ? "completo" :
                        arrayStatusMateriaMae[2] === 100 ? "revisar" :
                            arrayStatusMateriaMae[1] === 100 ? "incompleto" : "";
                    $scope.materiasUnificadas[z].arrayStatus = arrayStatusMateriaMae;

                }

                waitingDialog.hide();
            });

            $scope.estudar = function () {
                if ($scope.array && $scope.array.length > 0) {
                    $modal
                        .open({
                            templateUrl: 'views/estudar/estudar.html',
                            controller: 'EstudarController',
                            resolve: {
                                assuntosDB: function () {
                                    return Assuntos;
                                },
                                arraySelecionados: function () {
                                    return $scope.array;
                                },
                                materias: function () {
                                    return $scope.materiasUnificadas;
                                }
                            }
                        }).result.then(function () {
                            $scope.recalcular();
                            $scope.initHome();
                        }, function () {
                        });
                }
            };
        };
    }]);