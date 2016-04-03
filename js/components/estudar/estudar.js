angular.module('estudos').controller('EstudarController', function ($scope, assuntosDB, arraySelecionados, materias) {

    $scope.initEstudar = function () {

        $scope.estudo = {
            total: 0,
            acerto: 0,
            data: new Date(),
            tempo: 0,
            observacao: "",
            status: "incompleto"
        };

        $scope.Math = window.Math;
    };

    $scope.confirmarEstudo = function () {
        $scope.estudo.aproveitamento = 0;
        if($scope.estudo.total !== 0) {
            $scope.estudo.aproveitamento = Math.floor(($scope.estudo.acerto / $scope.estudo.total) * 100);
        }
        var idAnterior = "";
        angular.forEach(arraySelecionados, function (selecionado, chaveSelection) {
            var mudouId = false;
            var id = selecionado.split("#")[0];
            var indice = selecionado.split("#")[1];
            if(idAnterior === "") {
                mudouId = true;
            } else {
                if(id !== idAnterior) {
                    mudouId = true;
                }
            }

            angular.forEach(materias, function (materia, chaveMateria) {
                //acha o assunto
                if(materia._id.$oid === id) {
                    //teste de relevancia.

                    var dataObj = {};
                    dataObj = angular.merge(dataObj, $scope.estudo);
                    dataObj.relevante = mudouId;
                    materia.materias[indice].datas.push(dataObj);

                    materia.materias[indice].geral.total += $scope.estudo.total;
                    materia.materias[indice].geral.acertos += $scope.estudo.acerto;
                    materia.materias[indice].geral.aproveitamento = 0;
                    if(materia.materias[indice].geral.total !== 0) {
                        materia.materias[indice].geral.aproveitamento =
                            Math.floor((materia.materias[indice].geral.acertos / materia.materias[indice].geral.total) * 100);
                    }

                    if(mudouId) {
                        materia.geral.total += materia.materias[indice].geral.total;
                        materia.geral.acertos += materia.materias[indice].geral.acertos;
                        materia.geral.aproveitamento = 0;
                        if(materia.geral.total !== 0) {
                            materia.geral.aproveitamento =
                                Math.floor((materia.geral.acertos / materia.geral.total) * 100);
                        }
                    }
                    idAnterior = id;
                }
            });
        });

        var salvos = 0;
        angular.forEach(materias, function (materia, chaveMateria) {
            materia.$saveOrUpdate().then(function () {
                salvos++;
                console.log("save");
                if(materias.length === salvos) {
                    $scope.$close(true);
                }
            });
        });
    };
    $scope.cancelarEstudo = function () {
        $scope.$dismiss();
    };
});