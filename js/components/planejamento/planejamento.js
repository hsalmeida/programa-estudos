angular.module('estudos').controller('PlanejamentoController', ['$scope', '$rootScope', '$state', 'Assuntos',
    '$uibModal', '$q', 'Planejamentos',
    function ($scope, $rootScope, $state, Assuntos, $uibModal, $q, Planejamentos) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        $scope.planejamentos = [];

        $scope.initPlanejamento = function () {
            waitingDialog.show("Aguarde. Carregando planejamentos");
            $scope.planejamentos = [];
            var plaQ = {
                usuario: $rootScope.usuarioLogado._id.$oid
            };
            Planejamentos.query(plaQ).then(function (planejamentos) {
                $scope.planejamentos = planejamentos;
                waitingDialog.hide();
            });
        };

        $scope.ver = function (planejamento) {

        };

        $scope.editar = function (planejamento) {
            $state.go('planejamento-materias', {id: planejamento._id.$oid});
        };

        $scope.novoPlanejamento = function () {
            $state.go('planejamento-materias', {id: null});
        };
    }]);

angular.module('estudos').controller('VerPlanejamentoController', ['$scope', '$rootScope', '$state', '$stateParams',
    'Assuntos', '$uibModal', '$q', 'Planejamentos', '$filter',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $uibModal, $q, Planejamentos, $filter) {
        $scope.planejamento = {};
        $scope.assuntos = [];
        $scope.usuario = $rootScope.usuarioLogado;
        $scope.today = moment();
        $scope.dateSelected;
        $scope.dateSearch = moment();
        $scope.estudos = [];
        $scope.disableToday = false;
        $scope.centerDay = {};
        $scope.yesterday = {};
        $scope.beforeYesterday = {};
        $scope.tomorow = {};
        $scope.afterTomorow = {};

        $scope.initVerPlanejamento = function () {
            if ($stateParams.id) {
                waitingDialog.show("Aguarde. Carregando planejamento");
                $scope.dateSelected = 2;
                $scope.centerDay = angular.copy($scope.dateSearch);
                $scope.yesterday = moment($scope.dateSearch).subtract(1, 'd');
                $scope.beforeYesterday = moment($scope.dateSearch).subtract(2, 'd');
                $scope.tomorow = moment($scope.dateSearch).add(1, 'd');
                $scope.afterTomorow = moment($scope.dateSearch).add(2, 'd');
                Planejamentos.getById($stateParams.id).then(function (plan) {
                    plan.prova.$date = new Date(plan.prova.$date);
                    $scope.planejamento = plan;
                    var ativos = {
                        "ativo": true,
                        "usuario": $rootScope.usuarioLogado._id.$oid
                    };
                    Assuntos.query(ativos, {sort: {"assunto": 1}}).then(function (assuntos) {
                        $scope.assuntos = assuntos;
                        carregarEstudos(plan);
                        waitingDialog.hide();
                        $scope.disableToday = true;
                    });
                });
            }
        };

        function carregarEstudos(planejamento) {
            var nomeDia = recuperarDia();
            var dataDia = recuperarData();
            //verificar se possui estudo nesse dia.
            if (planejamento.horarios[nomeDia].length > 0) {
                $scope.estudos = angular.copy(planejamento.horarios[nomeDia]);
                angular.forEach($scope.estudos, function (estudo, chave) {
                    var materia = $filter('filter')(planejamento.materias, {id: estudo.materia});
                    estudo.assunto = materia && materia.length > 0 ? materia[0] : {};
                    estudo.tempo = 0;
                    estudo.tempoNecessario = (estudo.hora * 60) + estudo.minuto;
                    var assunto = $filter('filter')($scope.assuntos, {_id : { $oid: estudo.materia} });
                    if(assunto && assunto.length > 0) {
                        angular.forEach(assunto[0].materias, function (mat, chaveMat) {
                            angular.forEach(mat.datas, function (data, chaveData) {
                                if(data.data.contains(dataDia)) {
                                    var re = /^([0-9]{1,2}):([0-9]{2})$/gm;
                                    var m = re.exec(data.tempo);
                                    estudo.tempo += (Number(m[1]) * 60) + Number(m[2]);
                                }
                            });
                        });
                        estudo.concluido = (estudo.tempo / estudo.tempoNecessario) * 100;
                    }
                });
            }
        }

        function recuperarData() {
            return $scope.dateSearch.format("YYYY-MM-DD");
        }

        function recuperarDia() {
            switch ($scope.dateSearch.format("e")) {
                case "0":
                    return "domingo";
                case "1":
                    return "segunda";
                case "2":
                    return "terca";
                case "3":
                    return "quarta";
                case "4":
                    return "quinta";
                case "5":
                    return "sexta";
                case "6":
                    return "sabado";
            }
        }

    }]);

angular.module('estudos').controller('PlanejamentoMateriasController', ['$scope', '$rootScope', '$state', '$stateParams',
    'Assuntos', '$uibModal', '$q', 'Planejamentos',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $uibModal, $q, Planejamentos) {
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
            var format = "YYYY-MM-DD";
            $scope.minMax = {
                min: moment().format(format),
                max: moment().add(12, 'months').format(format)
            };

            if ($stateParams.id) {
                waitingDialog.show("Aguarde. Carregando planejamento");
                Planejamentos.getById($stateParams.id).then(function (plan) {
                    plan.prova.$date = new Date(plan.prova.$date);
                    $scope.planejamento = plan;
                    $scope.calculaHorasSemana();
                    waitingDialog.hide();
                });
            } else {
                waitingDialog.show("Aguarde. Carregando matérias");
                var ativos = {
                    "ativo": true,
                    "usuario": $rootScope.usuarioLogado._id.$oid
                };
                Assuntos.query(ativos, {sort: {"assunto": 1}}).then(function (assuntos) {
                    $scope.planejamento = new Planejamentos({
                        maximoMinutosPorMateria: 120,
                        nome: "",
                        prova: {$date: null},
                        naoSabeFim: false,
                        ativo: true,
                        usuario: $rootScope.usuarioLogado._id.$oid,
                        materias: [],
                        cargaHorariaTotal: 0,
                        horarios: {
                            domingo: [],
                            segunda: [],
                            terca: [],
                            quarta: [],
                            quinta: [],
                            sexta: [],
                            sabado: []
                        }
                    });
                    for (var m = 0; m < assuntos.length; m++) {
                        var tempM = assuntos[m];
                        $scope.planejamento.materias.push(
                            {
                                assunto: tempM.assunto,
                                peso: 1,
                                conhecimento: 0,
                                selecionada: true,
                                id: tempM._id.$oid,
                                cargaHorariaHoras: 50,
                                cargaHorariaHorasMinutos: 3000
                            }
                        );
                    }
                    $scope.calculaHorasSemana();
                    waitingDialog.hide();
                });
            }
        };

        $scope.tabMateriaSelecionada = function () {
            $scope.calcularCargaHoraria();
        };

        $scope.tabTempoSelecionada = function () {
            $scope.calcularCargaHoraria();
        };

        $scope.adicionarMateria = function (dia) {
            $scope.planejamento.horarios[dia].push({
                materia: "",
                hora: 0,
                minuto: 0
            })
        };

        $scope.removerMateria = function (dia, indice) {
            $scope.planejamento.horarios[dia].splice(indice, 1);
            $scope.calculaHorasSemana();
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
            $scope.calcularCargaHoraria();
        };
        $scope.irDados = function () {
            $scope.active = 0;
        };
        $scope.irTempo = function () {
            $scope.active = 2;
        };

        $scope.verPlanejamento = function () {
            /*
            $scope.planejamento.totalMultiplicador = 0;
            angular.forEach($scope.planejamento.materias, function (materia, key) {
                if (materia.selecionada) {
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
                }
            });
            $scope.planejamento.minutosPorPeso = $scope.planejamento.minutosSemanais / $scope.planejamento.totalMultiplicador | 0;
            angular.forEach($scope.planejamento.materias, function (materia, key) {
                if (materia.selecionada) {
                    materia.totalPorCiclo = materia.multiplicador * $scope.planejamento.minutosPorPeso;
                }
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
                }).result.then(function () {
            }, function () {
            });
            */
            waitingDialog.show("Aguarde. Salvando planejamento");
            $scope.planejamento.$saveOrUpdate().then(function () {
                waitingDialog.hide();
                $state.go("planejamento");
            });
        };

        $scope.calcularCargaHoraria = function () {
            $scope.planejamento.cargaHorariaTotal = 0;
            angular.forEach($scope.planejamento.materias, function (materia, key) {
                if (materia.selecionada) {
                    $scope.planejamento.cargaHorariaTotal += materia.cargaHorariaHoras;
                }
            });
        };

        $scope.calculaHorasSemana = function () {
            var horasNaSemana = 0;
            var minutosNaSemana;
            //vejo cada dia
            var minutosTempD = 0;
            angular.forEach($scope.planejamento.horarios, function (horario, key) {
                angular.forEach(horario, function (dia, nome) {
                    horasNaSemana += dia.hora;
                    minutosTempD += dia.minuto;
                });
            });
            horasNaSemana += minutosTempD / 60 | 0;
            minutosNaSemana = minutosTempD % 60 | 0;

            $scope.calculoSemana = horasNaSemana + "h" + " " + minutosNaSemana + "'";
            $scope.planejamento.calculoSemana = $scope.calculoSemana;
            $scope.planejamento.minutosSemanais = (horasNaSemana * 60) + minutosNaSemana;
            $scope.quantidadeSemanas = $scope.planejamento.cargaHorariaTotal / horasNaSemana | 0;
            $scope.dataTerminoEstudo = moment().add($scope.quantidadeSemanas, 'w').toDate();
            $scope.semanasLivres = moment($scope.planejamento.prova.$date).diff(moment($scope.dataTerminoEstudo), 'weeks') | 0;

        };
    }])
;