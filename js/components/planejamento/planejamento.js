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
        $scope.horas = [{label: "0h",value: 0},{label: "1h",value: 1},{label: "2h",value: 2},{label: "3h",value: 3},{label: "4h",value: 4},{label: "5h",value: 5},{label: "6h",value: 6},{label: "7h",value: 7},{label: "8h",value: 8},{label: "9h",value: 9},{label: "10h",value: 10}];
        $scope.minutos = [{label: "0'",value: 0},{label: "15",value: 15},{label: "30",value: 30},{label: "45",value: 45}];
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
                for(var m = 0;m < assuntos.length; m++) {
                    var tempM = assuntos[m];
                    $scope.planejamento.materias.push(
                        {
                            assunto: tempM.assunto,
                            peso: 1,
                            conhecimento: 0,
                            selecionada: false,
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

            };

            $scope.calculaHorasSemana = function () {
                var horasNaSemana = 0;
                var minutosNaSemana = 0;
                if($scope.planejamento.diaAdia) {
                    //vejo cada dia
                    var minutosTempD = 0;
                    angular.forEach($scope.planejamento.horarios, function (horario, key) {
                        if(key !== "semana") {
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
            };
            $scope.mudaSemanaClicada = function () {

            };
        };

    }]);