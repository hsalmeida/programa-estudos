angular.module('estudos').controller('ChartDesController', ['$scope', '$rootScope', '$state', 'Assuntos',
    function ($scope, $rootScope, $state, Assuntos) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        $scope.detalhado = false;
        $scope.assuntoSelecionado = {};
        $scope.initChart = function () {
            $scope.detalhado = false;
            waitingDialog.show("Aguarde. Carregando assuntos");
            var ativos = {
                "ativo": true,
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            Assuntos.query(ativos, {sort: {"assunto": 1}}).then(function (assuntos) {
                $scope.assuntos = assuntos;

                $scope.chartoptions = {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    scales: {
                        xAxes: [{
                            type: "linear",
                            ticks: {
                                max: 100,
                                min: 0,
                                stepSize: 10
                            }
                        }]
                    }
                };
                $scope.colours = ['#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#f20005', '#1200d4', '#DCDCDC'];
                gerarGraficoPadrao(assuntos);
                waitingDialog.hide();

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };

        function gerarGraficoPadrao(assuntos) {
            $scope.barlabels = [];
            $scope.series = ['Total', 'Melhor'];
            var total = [];
            var melhor = [];
            for (var a = 0; a < assuntos.length; a++) {
                if (assuntos[a]) {
                    var assunto = assuntos[a];
                    if (assunto) {
                        var melhorTemp = 0;
                        for (var j = 0; j < assunto.materias.length; j++) {
                            if (assunto.materias[j].ativo && assunto.materias[j].geral.aproveitamento > melhorTemp) {
                                melhorTemp = assunto.materias[j].geral.aproveitamento;
                            }
                        }
                        if (!$scope.detalhado) {
                            $scope.barlabels.push(assunto.assunto);
                            total.push(assunto.geral.aproveitamento);
                            melhor.push(melhorTemp);
                        }
                    }
                }
            }
            $scope.bardata = [total, melhor];
        }

        $scope.criarGraficoDesempenho = function () {
            if ($scope.assuntoSelecionado && $scope.assuntoSelecionado._id) {
                waitingDialog.show("Aguarde. Carregando gráfico");

                var total = [];
                var melhor = [];
                $scope.bardata = [total, melhor];
                $scope.barlabels = [];

                Assuntos.getById($scope.assuntoSelecionado._id.$oid).then(function (assunto) {

                    if (!$scope.detalhado) {
                        $scope.series[1] = "Melhor";
                        var melhorTemp = 0;
                        for (var q = 0; q < assunto.materias.length; q++) {
                            if (assunto.materias[q].ativo && assunto.materias[q].geral.aproveitamento > melhorTemp) {
                                melhorTemp = assunto.materias[q].geral.aproveitamento;
                            }
                        }
                        total.push(assunto.geral.aproveitamento);
                        melhor.push(melhorTemp);
                        $scope.barlabels.push(assunto.assunto);
                    } else {
                        $scope.series[1] = $rootScope.usuarioLogado.calculoDesempenho === "melhor" ? "Melhor" : "Último";
                        for (var j = 0; j < assunto.materias.length; j++) {
                            var totalAproveitamentoTemp = 0;
                            if(assunto.materias[j].ativo) {
                                if (assunto.materias[j].geral.totalGeral !== 0) {
                                    totalAproveitamentoTemp =
                                        Math.round((assunto.materias[j].geral.totalAcertos
                                            / assunto.materias[j].geral.totalGeral) * 100);
                                }

                                var texto = assunto.materias[j].texto;
                                if (assunto.materias[j].texto.length > 50) {
                                    texto = texto.substring(0, 50) + "...";
                                }
                                $scope.barlabels.push(texto);
                                total.push(totalAproveitamentoTemp);
                                melhor.push(assunto.materias[j].geral.aproveitamento);
                            }
                        }
                    }

                    $scope.bardata = [total, melhor];
                    waitingDialog.hide();
                });
            } else {
                $scope.detalhado = false;
                gerarGraficoPadrao($scope.assuntos);
            }
        };

        /*
         $scope.$on('chart-create', function (event, chart) {
         createOrUpdateChart(event, chart);
         });

         $scope.$on('chart-update', function (event, chart) {
         createOrUpdateChart(event, chart);
         });
         function createOrUpdateChart(event, chart) {
         var bgColors = [];
         var borderColors = [];
         if (chart.config.data.datasets[1]) {
         if (chart.config.data.datasets[1].data) {

         for(var i = 0; i < chart.config.data.datasets[1].data.length; i++) {
         var bar = chart.config.data.datasets[1].data[i];
         if (bar && bar <= 70) {

         bgColors.push('rgba(242,0,0,0.5)');
         borderColors.push('rgba(242,0,0,1)');
         }
         if (bar && bar > 70) {

         bgColors.push('rgba(0,0,242,0.5)');
         borderColors.push('rgba(0,0,242,1)');
         }
         if (bar && bar > 80) {

         bgColors.push('rgba(33,242,0,0.5)');
         borderColors.push('rgba(33,242,0,1)');
         }
         }

         chart.config.data.datasets[1].backgroundColor = bgColors;
         chart.config.data.datasets[1].borderColor = borderColors;
         }
         }
         }
         */

    }]);

angular.module('estudos').controller('ChartController', ['$scope', '$rootScope', '$state', 'Assuntos',
    function ($scope, $rootScope, $state, Assuntos) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        $scope.initChart = function () {
            waitingDialog.show("Aguarde. Carregando gráfico");
            var ativos = {
                "ativo": true,
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            Assuntos.query(ativos, {sort: {"assunto": 1}}).then(function (assuntos) {
                var materiasUnificadas = assuntos;

                $scope.colours = ['#f20005', '#1200d4', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'];

                $scope.chartoptions = {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    scales: {
                        xAxes: [{
                            stacked: true,
                            type: "linear",
                            ticks: {
                                max: 100,
                                min: 0,
                                stepSize: 5
                            }
                        }],
                        yAxes: [{
                            stacked: true
                        }]
                    }
                };

                $scope.barlabels1 = [];

                var dadosEstudos = [];
                var dadosNaoEstudos = [];
                $scope.series = ['Horas'];
                $scope.series1 = ['Não estudado', 'Estudado'];

                for (var z = 0; z < materiasUnificadas.length; z++) {
                    var totalEstudo = 0;
                    var estudada = 0;
                    var lenAtiva = 0;
                    for (var j = 0; j < materiasUnificadas[z].materias.length; j++) {
                        if(materiasUnificadas[z].materias[j].ativo) {
                            lenAtiva++;
                            if (materiasUnificadas[z].materias[j].status === "revisar" ||
                                materiasUnificadas[z].materias[j].status === "completo") {
                                estudada++;
                            }
                            /*
                            var parcialEstudo = 0;
                            var parcialNaoEstudo = 0;
                            for (var a = 0; a < materiasUnificadas[z].materias[j].datas.length; a++) {

                                if (materiasUnificadas[z].materias[j].datas[a].status === "revisar" ||
                                    materiasUnificadas[z].materias[j].datas[a].status === "completo") {
                                    parcialEstudo++;
                                } else {
                                    parcialNaoEstudo++;
                                }
                            }
                            if (parcialEstudo > 0 && parcialEstudo == parcialNaoEstudo) {
                                estudada++;
                            } else {
                                if (parcialEstudo > parcialNaoEstudo) {
                                    estudada++;
                                }
                            }
                            */
                        }
                    }
                    totalEstudo = Math.round((estudada / lenAtiva) * 100);
                    dadosEstudos.push(totalEstudo);
                    dadosNaoEstudos.push(100 - totalEstudo);

                    $scope.barlabels1.push(materiasUnificadas[z].assunto);
                }
                $scope.bardata1 = [dadosNaoEstudos, dadosEstudos];

                waitingDialog.hide();

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };
    }]);