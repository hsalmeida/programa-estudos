angular.module('estudos').controller('EstudarController', function ($scope, assuntosDB, arraySelecionados, materias) {

    $scope.initEstudar = function () {

        $scope.estudo = {
            total: 0,
            acerto: 0,
            aproveitamento: 0,
            data: new Date(),
            tempo: null,
            observacao: "",
            status: "incompleto"
        };
        $scope.classBtn = "";
        $scope.nameBtn = "Confirmar Estudo";
        $scope.Math = window.Math;
    };

    function formValido () {
        $scope.dataError = "";
        $scope.tempoError = "";
        var valido = true;
        if(!$scope.estudo.data) {
            valido = false;
            $scope.dataError = "Data do estudo é obrigatória";
        }

        if(!$scope.estudo.tempo) {
            valido = false;
            $scope.tempoError = "Tempo de estudo é obrigatório";
        }

        return valido;
    }

    $scope.confirmarEstudo = function () {

        if(formValido()) {
            $scope.nameBtn = "Salvando";
            $scope.classBtn = "disabled";
            $scope.estudo.aproveitamento = 0;
            if ($scope.estudo.total !== 0) {
                $scope.estudo.aproveitamento = Math.floor(($scope.estudo.acerto / $scope.estudo.total) * 100);
            }
            var idAnterior = "";
            angular.forEach(arraySelecionados, function (selecionado, chaveSelection) {
                var mudouId = false;
                var id = selecionado.split("#")[0];
                var indice = selecionado.split("#")[1];
                if (idAnterior === "") {
                    mudouId = true;
                } else {
                    if (id !== idAnterior) {
                        mudouId = true;
                    }
                }

                angular.forEach(materias, function (materia, chaveMateria) {
                    //acha o assunto
                    if (materia._id.$oid === id) {
                        //teste de relevancia.

                        var dataObj = {};
                        dataObj = angular.merge(dataObj, $scope.estudo);
                        dataObj.relevante = mudouId;
                        materia.materias[indice].datas.push(dataObj);

                        //nova forma de calculo que tem que verificar o melhor desempenho.
                        var melhorTotal = 0;
                        var melhotAcerto = 0;
                        var melhorAproveitamento = 0;
                        angular.forEach(materia.materias[indice].datas, function (data, chaveData) {
                            if (data.aproveitamento > melhorAproveitamento) {
                                melhorAproveitamento = data.aproveitamento;
                                melhorTotal = data.total;
                                melhotAcerto = data.acerto;
                            }
                        });

                        materia.materias[indice].geral.total = melhorTotal;
                        materia.materias[indice].geral.acertos = melhotAcerto;
                        materia.materias[indice].geral.aproveitamento = melhorAproveitamento;

                        idAnterior = id;
                    }
                });
            });

            var salvos = 0;
            angular.forEach(materias, function (materia, chaveMateria) {
                materia.$saveOrUpdate().then(function () {
                    salvos++;
                    console.log("save");
                    if (materias.length === salvos) {
                        $scope.$close(true);
                    }
                });
            });
        }
    };
    $scope.cancelarEstudo = function () {
        $scope.$dismiss();
    };
});