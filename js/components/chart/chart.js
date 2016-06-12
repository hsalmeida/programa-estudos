angular.module('estudos').controller('ChartDesController', ['$scope', '$rootScope', '$state', 'Assuntos',
    function ($scope, $rootScope, $state, Assuntos) {
        $scope.initChart = function () {
            waitingDialog.show("Aguarde. Carregando gráfico");
            Assuntos.all({sort: {"assunto": 1}}).then(function (assuntos) {
                var materiasUnificadas = assuntos;

                $scope.colours = ['#0004f2','#21f200', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'];

                $scope.barlabels = [];

                var total = [];
                var melhor = [];

                $scope.series = ['Total', 'Melhor'];

                for (var z = 0; z < materiasUnificadas.length; z++) {

                    var totalUnificado = 0;
                    var acertoUnificado = 0;

                    for (var j = 0; j < materiasUnificadas[z].materias.length; j++) {

                        var acertoMateriaTemp = 0;
                        var totalMateriaTemp = 0;

                        for (var a = 0; a < materiasUnificadas[z].materias[j].datas.length; a++) {

                            totalMateriaTemp += materiasUnificadas[z].materias[j].datas[a].total;
                            acertoMateriaTemp += materiasUnificadas[z].materias[j].datas[a].acerto;
                        }

                        totalUnificado += totalMateriaTemp;
                        acertoUnificado += acertoMateriaTemp;
                    }
                    var aproveitamentoTotal = totalUnificado !== 0 ? Math.round((acertoUnificado / totalUnificado) * 100) : 0;
                    total.push(aproveitamentoTotal);
                    melhor.push(materiasUnificadas[z].geral.aproveitamento);
                    $scope.barlabels.push(materiasUnificadas[z].assunto);
                }

                $scope.bardata = [total, melhor];

                waitingDialog.hide();

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };
    }]);

angular.module('estudos').controller('ChartController', ['$scope', '$rootScope', '$state', 'Assuntos',
    function ($scope, $rootScope, $state, Assuntos) {
        $scope.initChart = function () {
            waitingDialog.show("Aguarde. Carregando gráfico");
            Assuntos.all({sort: {"assunto": 1}}).then(function (assuntos) {
                var materiasUnificadas = assuntos;

                $scope.colours = ['#f20005','#1200d4', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'];

                $scope.barlabels1 = [];
                $scope.barlabels = [];

                var dadosBar = [];
                var dadosEstudos = [];
                var dadosNaoEstudos = [];
                $scope.series = ['Horas'];
                $scope.series1 = ['Não estudado', 'Estudado'];


                for (var z = 0; z < materiasUnificadas.length; z++) {

                    var totalHoras = 0;
                    var totalEstudo = 0;
                    var estudada = 0;
                    for (var j = 0; j < materiasUnificadas[z].materias.length; j++) {
                        var parcialEstudo = 0;
                        var parcialNaoEstudo = 0;
                        for (var a = 0; a < materiasUnificadas[z].materias[j].datas.length; a++) {

                            if (materiasUnificadas[z].materias[j].datas[a].status === "revisar" ||
                                materiasUnificadas[z].materias[j].datas[a].status === "completo") {
                                parcialEstudo++;
                            } else {
                                parcialNaoEstudo++;
                            }

                            var horas = new Date(materiasUnificadas[z].materias[j].datas[a].tempo).getHours();
                            var minutos = new Date(materiasUnificadas[z].materias[j].datas[a].tempo).getMinutes();
                            if (minutos > 0) {
                                minutos = (minutos / 60);
                                horas += minutos;
                            }
                            totalHoras += horas;
                        }
                        if (parcialEstudo > 0 && parcialEstudo == parcialNaoEstudo) {
                            estudada++;
                        } else {
                            if (parcialEstudo > parcialNaoEstudo) {
                                estudada++;
                            }
                        }
                    }

                    totalEstudo = Math.round((estudada * 100) / materiasUnificadas[z].materias.length);
                    dadosEstudos.push(totalEstudo);
                    dadosNaoEstudos.push(100 - totalEstudo);
                    dadosBar.push(totalHoras);
                    $scope.barlabels1.push(materiasUnificadas[z].assunto);
                    $scope.barlabels.push(materiasUnificadas[z].assunto);
                }
                $scope.bardata1 = [dadosNaoEstudos, dadosEstudos];
                $scope.bardata = [dadosBar];

                waitingDialog.hide();

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };
    }]);