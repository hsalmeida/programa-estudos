angular.module('estudos').controller('PlanejamentoController', ['$scope', '$rootScope', '$state', 'Assuntos',
    '$modal', '$q',
    function ($scope, $rootScope, $state, Assuntos, $modal, $q) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };

        $scope.planejamentos = [];

        $scope.initPlanejamento = function () {
            $scope.planejamentos = [{
                nome: "TRT",
                prova: (new Date().setMonth(9)),
                materias: [{id: "1"}, {id: 2}],
                ativo: true
            },
                {
                    nome: "TRF",
                    prova: (new Date().setMonth(8)),
                    materias: [{id: "1"}, {id: 2}],
                    ativo: true
                },
                {
                    nome: "STF",
                    prova: (new Date().setMonth(7)),
                    materias: [{id: "1"}, {id: 2}],
                    ativo: true
                }
            ];

        };

        $scope.novoPlanejamento = function () {
            $modal
                .open({
                    templateUrl: 'criarPlanejamento.html',
                    controller: function ($scope) {
                        $scope.initNovo = function () {

                        };
                        $scope.confirmar = function () {

                        };
                        $scope.cancelar = function () {

                        };
                    }
                }).result.then(function () {
                /*
                 $scope.recalcular();
                 $scope.initHome();
                 */
            }, function () {
            });
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