angular.module('estudos').controller('PlanejamentoController', ['$scope', '$rootScope', '$state', 'Assuntos',
    '$uibModal', '$q', 'Planejamentos',
    function ($scope, $rootScope, $state, Assuntos, $uibModal, $q, Planejamentos) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        $scope.idPlanejamento = "";
        $scope.planejamentos = [];

        $scope.initPlanejamento = function () {
            $scope.planejamentos = [];
            var plaQ = {
                usuario: $rootScope.usuarioLogado._id.$oid
            };
            Planejamentos.query(plaQ).then(function (planejamentos) {
                $scope.planejamentos = planejamentos;
            });
        };

        $scope.novoPlanejamento = function () {
            $state.go('planejamento-materias');
        };
    }]);

angular.module('estudos').controller('PlanejamentoMateriasController', ['$scope', '$rootScope', '$state', '$state',
    'Assuntos', '$uibModal', '$q',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $uibModal, $q) {
        $scope.planejamento = {};
        $scope.provaTemp = null;
        $scope.active = 0;
        $scope.usuario = $rootScope.usuarioLogado;
        $scope.pesos = [1, 2, 3];
        $scope.horas = [{label: "0h", value: 0}, {label: "1h", value: 1}, {label: "2h", value: 2}, {
            label: "3h",
            value: 3
        }, {label: "4h", value: 4}, {label: "5h", value: 5}, {label: "6h", value: 6}, {
            label: "7h",
            value: 7
        }, {label: "8h", value: 8}, {label: "9h", value: 9}, {label: "10h", value: 10}];
        $scope.minutos = [{label: "00'", value: 0}, {label: "15'", value: 15}, {label: "30'", value: 30}, {
            label: "45'",
            value: 45
        }];
        $scope.calculoSemana = "";

        $scope.initPlanejamentoMaterias = function () {
            waitingDialog.show("Aguarde. Carregando matérias");
            var ativos = {
                "ativo": true,
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            Assuntos.query(ativos, {sort: {"assunto": 1}}).then(function (assuntos) {
                $scope.planejamento = {
                    nome: "",
                    prova: {$date: null},
                    naoSabeFim: false,
                    ativo: true,
                    usuario: $rootScope.usuarioLogado._id.$oid,
                    materias: [],
                    diaAdia: false,
                    horarios: {
                        domingo: {
                            hora: 0,
                            minuto: 0
                        },
                        segunda: {
                            hora: 0,
                            minuto: 0
                        },
                        terca: {
                            hora: 0,
                            minuto: 0
                        },
                        quarta: {
                            hora: 0,
                            minuto: 0
                        },
                        quinta: {
                            hora: 0,
                            minuto: 0
                        },
                        sexta: {
                            hora: 0,
                            minuto: 0
                        },
                        sabado: {
                            hora: 0,
                            minuto: 0
                        },
                        semana: {
                            hora: 0,
                            minuto: 0
                        }
                    }
                };
                for (var m = 0; m < assuntos.length; m++) {
                    var tempM = assuntos[m];
                    $scope.planejamento.materias.push(
                        {
                            assunto: tempM.assunto,
                            peso: 1,
                            conhecimento: 0,
                            selecionada: true,
                            id: tempM._id.$oid
                        }
                    );
                }
                var format = "YYYY-MM-DD";
                $scope.minMax = {
                    min: moment().format(format),
                    max: moment().add(12, 'months').format(format)
                };
                $scope.calculaHorasSemana();
                waitingDialog.hide();
            });


        };
        $scope.modificaNaoSei = function () {
            if ($scope.planejamento.naoSabeFim) {
                $scope.provaTemp = angular.copy($scope.planejamento.prova.$date);
                $scope.planejamento.prova.$date = moment().add(12, 'months').toDate();
            } else {
                $scope.planejamento.prova.$date = angular.copy($scope.planejamento.provaTemp);
            }
        };
        $scope.irMaterias = function () {
            $scope.active = 1;

        };
        $scope.irDados = function () {
            $scope.active = 0;
        };
        $scope.irTempo = function () {
            $scope.active = 2;
        };

        $scope.verPlanejamento = function () {
            $scope.planejamento.totalMultiplicador = 0;
            angular.forEach($scope.planejamento.materias, function (materia, key) {
                switch (materia.conhecimento) {
                    case 0:
                    case 25:
                        materia.conhecimentoMultiplicador = 3;
                        break;
                    case 50:
                        materia.conhecimentoMultiplicador = 2;
                        break;
                    case 75:
                    case 100:
                        materia.conhecimentoMultiplicador = 1;
                        break;
                    default:
                        materia.conhecimentoMultiplicador = 3;
                        break;
                }
                materia.multiplicador = materia.peso * materia.conhecimentoMultiplicador;
                $scope.planejamento.totalMultiplicador += materia.multiplicador;
            });
            $scope.planejamento.minutosPorPeso = $scope.planejamento.minutosSemanais / $scope.planejamento.totalMultiplicador | 0;
            angular.forEach($scope.planejamento.materias, function (materia, key) {
                materia.totalPorCiclo = materia.multiplicador * $scope.planejamento.minutosPorPeso;
            });
            $uibModal
                .open({
                    templateUrl: 'views/planejamento/planejamento.modal.html',
                    controller: function ($scope, planejamento) {
                        $scope.planejamento = planejamento;
                        $scope.fechar = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        planejamento: function () {
                            return $scope.planejamento;
                        }
                    }
                }).result.then(function () {}, function () {});
        };

        $scope.calculaHorasSemana = function () {
            var horasNaSemana = 0;
            var minutosNaSemana = 0;
            if ($scope.planejamento.diaAdia) {
                //vejo cada dia
                var minutosTempD = 0;
                angular.forEach($scope.planejamento.horarios, function (horario, key) {
                    if (key !== "semana") {
                        horasNaSemana += horario.hora;
                        minutosTempD += horario.minuto;
                    }
                });
                horasNaSemana += minutosTempD / 60 | 0;
                minutosNaSemana = minutosTempD % 60 | 0;
            } else {
                //ou calcula em cima do semana
                horasNaSemana = $scope.planejamento.horarios.domingo.hora + $scope.planejamento.horarios.sabado.hora + ($scope.planejamento.horarios.semana.hora * 5);
                var minutosTemp = $scope.planejamento.horarios.domingo.minuto + $scope.planejamento.horarios.sabado.minuto + ($scope.planejamento.horarios.semana.minuto * 5);
                horasNaSemana += minutosTemp / 60 | 0;
                minutosNaSemana = minutosTemp % 60 | 0;
            }
            $scope.calculoSemana = horasNaSemana + "h" + " " + minutosNaSemana + "'";
            $scope.planejamento.calculoSemana = $scope.calculoSemana;
            $scope.planejamento.minutosSemanais = (horasNaSemana * 60) + minutosNaSemana;
        };
        $scope.mudaSemanaClicada = function () {
            if ($scope.planejamento.diaAdia) {
                var tempHora = $scope.planejamento.horarios.semana.hora;
                var tempMin = $scope.planejamento.horarios.semana.minuto;
                angular.forEach($scope.planejamento.horarios, function (horario, key) {
                    if (key !== "semana" && key !== "sabado" && key !== "domingo") {
                        horario.hora = tempHora;
                        horario.minuto = tempMin;
                    }
                });
                $scope.planejamento.horarios.semana.hora = 0;
                $scope.planejamento.horarios.semana.minuto = 0;
            } else {
                $scope.planejamento.horarios.semana.hora = $scope.planejamento.horarios.segunda.hora;
                $scope.planejamento.horarios.semana.minuto = $scope.planejamento.horarios.segunda.minuto;
            }
            $scope.calculaHorasSemana();
        };
    }])
;