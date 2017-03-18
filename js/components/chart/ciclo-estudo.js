angular.module('estudos').controller('CicloEstudoController', ['$scope', '$rootScope', '$state', 'Assuntos',
    '$modal', '$q', 'ChartJsFactory',
    function ($scope, $rootScope, $state, Assuntos, $modal, $q, ChartJsFactory) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        $scope.models = {selected : null};
        $scope.initChart = function () {
            waitingDialog.show("Aguarde. Carregando gráfico");
            var ativos = {
                "ativo": true,
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            Assuntos.query(ativos, {sort: {"ordem": 1}}).then(function (assuntos) {

                $scope.chartoptions = {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    showLabel: true,
                    responsive: true,
                    maintainAspectRatio: true
                };

                $scope.labels = [];
                $scope.data = [];
                $scope.assuntos = [];
                $scope.colors = [];

                for (var z = 0; z < assuntos.length; z++) {
                    if (assuntos[z].horas) {
                        $scope.assuntos.push(assuntos[z]);
                        var re = /^([0-9]{2}):([0-9]{2})$/gm;
                        var m = re.exec(assuntos[z].horas);
                        var tempoData = Number(m[1]);
                        var minutoData = Number(m[2]);
                        if (minutoData !== 0) {
                            minutoData = minutoData / 60
                        }
                        tempoData += minutoData;
                        $scope.labels.push(assuntos[z].assunto);
                        $scope.colors.push(assuntos[z].cor);
                        $scope.data.push(tempoData);
                    }
                }

                waitingDialog.hide();

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };

        $scope.atualizarCiclo = function () {
            if($scope.assuntos) {
                var promisses = [];
                waitingDialog.show("Atualizando ordens. Aguarde.");
                for (var i = 0; i < $scope.assuntos.length; i++) {
                    $scope.assuntos[i].ordem = i;
                    var assunto = new Assuntos($scope.assuntos[i]);
                    promisses.push(assunto.$saveOrUpdate().then(function () {}));
                }
                $q.all(promisses).then(function () {
                    $state.reload();
                });
            }
        };

        $scope.adicionarMateria = function () {
            $modal
                .open({
                    templateUrl: 'adicionar.html',
                    controller: function ($scope, assuntosAdicionados) {
                        $scope.assuntoAdicao = {};
                        $scope.initCriar = function () {
                            $scope.tempos = [
                                "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00",
                                "02:15", "02:30", "02:45", "03:00", "03:15", "03:30", "03:45", "04:00"
                            ];
                            var listaAssuntos = [];
                            for (var e = 0; e < assuntosAdicionados.length; e++) {
                                listaAssuntos.push({"$oid": assuntosAdicionados[e]._id.$oid});
                            }
                            var ativos = {
                                "ativo": true,
                                "usuario": $rootScope.usuarioLogado._id.$oid,
                                "_id": {
                                    "$nin": listaAssuntos
                                }
                            };
                            Assuntos.query(ativos, {sort: {"assunto": 1}}).then(function (assuntos) {
                                $scope.assuntosSelecionaveis = assuntos;
                            });

                        };
                        $scope.confirmarAdicao = function () {
                            $scope.assuntoError = "";
                            $scope.tempoError = "";
                            if ($scope.assuntoAdicao.assunto) {
                                if ($scope.assuntoAdicao.horas) {
                                    $scope.classBtn = "disabled";
                                    $scope.assuntoAdicao.$saveOrUpdate().then(function () {
                                        $scope.$close(true);
                                    });
                                } else {
                                    $scope.tempoError = "Selecione o tempo no ciclo.";
                                }
                            } else {
                                $scope.assuntoError = "Selecione pelo menos uma matéria.";
                            }
                        };
                        $scope.cancelarAdicao = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        assuntosAdicionados: function () {
                            return $scope.assuntos;
                        }
                    }
                }).result.then(function () {
                    $state.reload();
                }, function () {

                });
        };

        $scope.editarTempo = function (assunto) {
            $modal
                .open({
                    templateUrl: 'editar.html',
                    controller: function ($scope, assuntoEdicao) {

                        $scope.initEditar = function () {
                            $scope.classBtn = "";
                            $scope.assuntoEdicao = assuntoEdicao;
                            $scope.tempos = [
                                "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00"
                            ];
                        };
                        $scope.confirmarEdicao = function () {
                            $scope.tempoError = "";
                            if ($scope.assuntoEdicao.horas) {
                                $scope.classBtn = "disabled";
                                $scope.assuntoEdicao.$saveOrUpdate().then(function () {
                                    $scope.$close(true);
                                });
                            } else {
                                $scope.tempoError = "Selecione o tempo no ciclo.";
                            }
                        };
                        $scope.cancelarAdicao = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        assuntoEdicao: function () {
                            return assunto;
                        }
                    }
                }).result.then(function () {
                    $state.reload();
                }, function () {

                });
        };

        $scope.removerTempo = function (assunto) {
            $modal
                .open({
                    templateUrl: 'exclusao.html',
                    controller: function ($scope) {
                        $scope.cancelarRemover = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarRemover = function () {
                            $scope.$close(true);
                        };
                    },
                    resolve: {
                        assuntoRemocao: function () {
                            return assunto;
                        }
                    }
                }).result.then(function () {
                    delete assunto.horas;
                    assunto.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {
                });
        };
    }]);