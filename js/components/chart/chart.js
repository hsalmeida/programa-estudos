angular.module('estudos').controller('ChartController', ['$scope', '$rootScope', '$state', 'Assuntos',
    function ($scope, $rootScope, $state, Assuntos) {

        waitingDialog.show();
        Assuntos.all({sort: {"assunto": 1}}).then(function (assuntos) {
            var materiasUnificadas = assuntos;
            $scope.labels = ["Em aberto", "Incompleto", "Revisar", "Completo"];
            $scope.data = [0, 0, 0, 0];

            $scope.options = {
                tooltipEvents: [],
                tooltipCaretSize: 0,
                showTooltips: true,
                onAnimationComplete: function () {
                    this.showTooltip(this.segments, true);
                }
            };

            for (var z = 0; z < materiasUnificadas.length; z++) {
                materiasUnificadas[z].status = materiasUnificadas[z].status ?
                    materiasUnificadas[z].status : '';
                var arrayStatusMateriaMae = [0, 0, 0, 0];
                materiasUnificadas[z].qtdMaterias = materiasUnificadas[z].materias.length;

                for (var j = 0; j < materiasUnificadas[z].materias.length; j++) {

                    var arrayStatus = [0, 0, 0, 0];
                    materiasUnificadas[z].materias[j].qtdDatas =
                        materiasUnificadas[z].materias[j].datas.length;

                    for (var a = 0; a < materiasUnificadas[z].materias[j].datas.length; a++) {
                        materiasUnificadas[z].materias[j].datas[a].status === "incompleto" ?
                            arrayStatus[1]++ : materiasUnificadas[z].materias[j].datas[a].status === "revisar" ?
                            arrayStatus[2]++ : materiasUnificadas[z].materias[j].datas[a].status === "completo" ?
                            arrayStatus[3]++ : arrayStatus[0]++;
                    }

                    for (var i = 0; i < arrayStatus.length; i++) {
                        if (materiasUnificadas[z].materias[j].qtdDatas > 0) {
                            arrayStatus[i] = Math.floor((arrayStatus[i] / materiasUnificadas[z].materias[j].qtdDatas) * 100);
                        }
                    }

                    if (materiasUnificadas[z].materias[j].qtdDatas === 0) {
                        arrayStatus[0] = 100;
                    }

                    materiasUnificadas[z].materias[j].status = arrayStatus[3] === 100 ? "completo" :
                        arrayStatus[2] === 100 ? "revisar" :
                            arrayStatus[1] === 100 ? "incompleto" : "";
                    materiasUnificadas[z].materias[j].arrayStatus = arrayStatus;

                    materiasUnificadas[z].materias[j].status === "incompleto" ?
                        arrayStatusMateriaMae[1]++ : materiasUnificadas[z].materias[j].status === "revisar" ?
                        arrayStatusMateriaMae[2]++ : materiasUnificadas[z].materias[j].status === "completo" ?
                        arrayStatusMateriaMae[3]++ : arrayStatusMateriaMae[0]++;

                }

                for (var b = 0; b < arrayStatusMateriaMae.length; b++) {
                    if (materiasUnificadas[z].qtdMaterias > 0) {
                        arrayStatusMateriaMae[b] =
                            Math.floor((arrayStatusMateriaMae[b] / materiasUnificadas[z].qtdMaterias) * 100);
                    }
                }

                materiasUnificadas[z].status = arrayStatusMateriaMae[3] === 100 ? "completo" :
                    arrayStatusMateriaMae[2] === 100 ? "revisar" :
                        arrayStatusMateriaMae[1] === 100 ? "incompleto" : "";
                materiasUnificadas[z].arrayStatus = arrayStatusMateriaMae;

                for (var w = 0; w < materiasUnificadas[z].arrayStatus.length; w++) {
                    $scope.data[w] += materiasUnificadas[z].arrayStatus[w];
                }

            }
            for (var q = 0; q < $scope.data.length; q++) {
                $scope.data[q] = Math.round(($scope.data[q] / 2400) * 100);
            }
            waitingDialog.hide();
        });
    }]);