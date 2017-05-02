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
            /*
             $uibModal
                .open({
                    templateUrl: 'criarPlanejamento.html',
                    backdrop: 'static',
                    resolve: {
                        idPlanejamento: function () {
                            return $scope.idPlanejamento;
                        },
                        usuario: function () {
                            return $rootScope.usuarioLogado._id.$oid;
                        }
                    },
                    controller: function ($scope, idPlanejamento, usuario) {
                        $scope.planejamento = {};
                        $scope.provaTemp = null;
                        $scope.initNovo = function () {
                            $scope.planejamento = {
                                nome: "",
                                prova: {$date: null},
                                naoSabeFim: false,
                                ativo: true,
                                usuario: usuario
                            };
                            var format = "YYYY-MM-DD";
                            $scope.minMax = {
                                min: moment().format(format),
                                max: moment().add(12, 'months').format(format)
                            };
                        };
                        $scope.confirmar = function () {
                            var planejamento = new Planejamentos();
                            planejamento = angular.merge(planejamento, $scope.planejamento);
                            planejamento.$saveOrUpdate().then(function (planejamento) {
                                idPlanejamento = planejamento._id.$oid;
                            });

                            $scope.$close(true);
                        };
                        $scope.cancelar = function () {
                            $scope.$dismiss();
                        };
                        $scope.modificaNaoSei = function () {
                            if ($scope.planejamento.naoSabeFim) {
                                $scope.provaTemp = angular.copy($scope.planejamento.prova.$date);
                                $scope.planejamento.prova.$date = moment().add(12, 'months').toDate();
                            } else {
                                $scope.prova.$date = angular.copy($scope.planejamento.provaTemp);
                            }
                        };
                    }
                }).result.then(function () {

            }, function () {
            });
            */
        };

        /*
         function calcularPorcentagemMaterias() {
         var porcentagens = [];
         var valorTotal = 0;
         for (var i = 0;; i++) {
         var hiddenImportancia = document.getElementById('Materia_' + i + '_importancia');
         if (hiddenImportancia == undefined) {
         break;
         }
         var valorLinha = +hiddenImportancia.value * +document.getElementById('Materia_' + i + '_dificuldade').value;
         valorTotal += valorLinha;
         porcentagens[i] = valorLinha;
         }
         for (var i = 0; i < porcentagens.length; i++) {
         var porcentagemMateria = arredondarParaUmaCasaDecimal((100 / valorTotal) * porcentagens[i]);
         document.getElementById('Materia_' + i + '_mostrador_porcentagem').value = porcentagemMateria + '%';
         document.getElementById('Materia_' + i + '_porcentagem').value = porcentagemMateria;
         }
         }
         */
    }]);

angular.module('estudos').controller('PlanejamentoMateriasController', ['$scope', '$rootScope', '$state', '$state',
    'Assuntos', '$uibModal', '$q',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $uibModal, $q) {
        $scope.planejamento = {};
        $scope.provaTemp = null;
        $scope.active = 0;

        $scope.initPlanejamentoMaterias = function () {

            $scope.planejamento = {
                nome: "",
                prova: {$date: null},
                naoSabeFim: false,
                ativo: true,
                usuario: $rootScope.usuarioLogado._id.$oid
            };
            var format = "YYYY-MM-DD";
            $scope.minMax = {
                min: moment().format(format),
                max: moment().add(12, 'months').format(format)
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
        };

    }]);