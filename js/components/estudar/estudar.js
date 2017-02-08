angular.module('estudos').controller('EstudarController', function ($scope, assuntosDB, arraySelecionados, materias, $q,
                                                                    $rootScope) {

    $scope.initEstudar = function () {

        $scope.tempos = [
            "00:00", "00:15", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00",
            "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
            "11:00", "11:30", "12:00"
        ];

        var date = new Date();
        date.setMilliseconds(0);
        date.setSeconds(0);

        $scope.estudo = {
            total: 0,
            acerto: 0,
            aproveitamento: 0,
            data: date,
            tempo: "00:00",
            observacao: "",
            status: "incompleto",
            _24h: false,
            _7d: false,
            _30d: false
        };
        $scope.classBtn = "";
        $scope.nameBtn = "Confirmar Estudo";
        $scope.Math = window.Math;
        $scope.usuario = $rootScope.usuarioLogado;
    };

    function formValido() {
        $scope.dataError = "";
        $scope.tempoError = "";
        var valido = true;
        if (!$scope.estudo.data) {
            valido = false;
            $scope.dataError = "Data do estudo é obrigatória";
        }

        if ($scope.estudo.tempo === "00:00") {
            valido = false;
            $scope.tempoError = "Tempo de estudo é obrigatório";
        }

        return valido;
    }

    $scope.confirmarEstudo = function () {

        if (formValido()) {
            $scope.nameBtn = "Salvando";
            $scope.classBtn = "disabled";
            $scope.estudo.aproveitamento = 0;
            if ($scope.estudo.total !== 0) {
                $scope.estudo.aproveitamento = Math.round(($scope.estudo.acerto / $scope.estudo.total) * 100);
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
                        //forma de persistir se é por melhor ou ultimo é decidido pelo usuário.
                        if ($scope.usuario.calculoDesempenho === "melhor") {
                            //melhor
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
                        } else {
                            //ultimo
                            melhorAproveitamento = dataObj.aproveitamento;
                            melhorTotal = dataObj.total;
                            melhotAcerto = dataObj.acerto;
                        }

                        materia.materias[indice].geral._24h = false;
                        materia.materias[indice].geral._7d = false;
                        materia.materias[indice].geral._30d = false;

                        materia.materias[indice].geral.total = melhorTotal;
                        materia.materias[indice].geral.acertos = melhotAcerto;
                        materia.materias[indice].geral.aproveitamento = melhorAproveitamento;

                        idAnterior = id;
                    }
                });
            });

            var promisses = [];
            angular.forEach(materias, function (materia, chaveMateria) {
                promisses.push(materia.$saveOrUpdate().then(function () {
                }));
            });
            $q.all(promisses).then(function () {
                console.log('salvar');
                $scope.$close(true);
            });
        }
    };
    $scope.cancelarEstudo = function () {
        $scope.$dismiss();
    };
});