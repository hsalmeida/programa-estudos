angular.module('estudos').controller('HomeController', ['$scope', '$rootScope', '$state', '$cookies', '$http', '$filter', '$modal',
    'Assuntos',
    function($scope, $rootScope, $state, $cookies, $http, $filter, $modal, Assuntos){

        /*
        status:
            padrao "em aberto"
            quando inicia um estudo "incompleto"
            na edição pode escolher "revisar" ou "completo"
        * */
        $scope.setselectedrow = function (index) {
            if($scope.selectedrow === index) {
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
            $state.go('detalhes',{materia: materiaId, indice: assuntoIndice});
        };

        $scope.initHome = function () {

            waitingDialog.show();

            Assuntos.all({sort : {"assunto" : 1}}).then(function (assuntos) {
                $scope.materiasUnificadas = assuntos;

                for(var z = 0;z < $scope.materiasUnificadas.length; z++) {
                    $scope.materiasUnificadas[z].status =  $scope.materiasUnificadas[z].status ?
                        $scope.materiasUnificadas[z].status : '';
                    var arrayStatusMateriaMae = [0,0,0,0];
                    $scope.materiasUnificadas[z].qtdMaterias = $scope.materiasUnificadas[z].materias.length;

                    for(var j = 0; j < $scope.materiasUnificadas[z].materias.length; j++) {

                        var arrayStatus = [0,0,0,0];
                        $scope.materiasUnificadas[z].materias[j].qtdDatas =
                            $scope.materiasUnificadas[z].materias[j].datas.length;

                        for(var a = 0; a < $scope.materiasUnificadas[z].materias[j].datas.length; a++){
                            $scope.materiasUnificadas[z].materias[j].datas[a].status === "incompleto" ?
                                arrayStatus[1]++ : $scope.materiasUnificadas[z].materias[j].datas[a].status === "revisar" ?
                                arrayStatus[2]++ : $scope.materiasUnificadas[z].materias[j].datas[a].status === "completo" ?
                                arrayStatus[3]++ : arrayStatus[0]++;
                        }

                        for(var i = 0; i < arrayStatus.length; i++) {
                            if($scope.materiasUnificadas[z].materias[j].qtdDatas > 0) {
                                arrayStatus[i] = Math.floor((arrayStatus[i] / $scope.materiasUnificadas[z].materias[j].qtdDatas) * 100);
                            }
                        }

                        if($scope.materiasUnificadas[z].materias[j].qtdDatas === 0) {
                            arrayStatus[0] = 100;
                        }

                        $scope.materiasUnificadas[z].materias[j].status = arrayStatus[3] === 100 ? "completo" :
                            arrayStatus[2] === 100 ? "revisar" :
                                arrayStatus[1] === 100 ? "incompleto" : "";
                        $scope.materiasUnificadas[z].materias[j].arrayStatus = arrayStatus;

                        $scope.materiasUnificadas[z].materias[j].status === "incompleto" ?
                            arrayStatusMateriaMae[1]++ : $scope.materiasUnificadas[z].materias[j].status === "revisar" ?
                            arrayStatusMateriaMae[2]++ : $scope.materiasUnificadas[z].materias[j].status === "completo" ?
                            arrayStatusMateriaMae[3]++ : arrayStatusMateriaMae[0]++;

                    }
                    console.log($scope.materiasUnificadas[z].qtdMaterias);
                    console.log(arrayStatusMateriaMae);

                    for(var b = 0; b < arrayStatusMateriaMae.length; b++) {
                        if($scope.materiasUnificadas[z].qtdMaterias > 0) {
                            arrayStatusMateriaMae[b] =
                                Math.floor((arrayStatusMateriaMae[b] / $scope.materiasUnificadas[z].qtdMaterias) * 100);
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
                if($scope.array && $scope.array.length > 0) {
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
                            $state.reload();
                        }, function () {
                        });
                }
            };
        };
    }]);