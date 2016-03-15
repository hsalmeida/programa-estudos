angular.module('estudos').controller('DetalhesController', ['$scope', '$rootScope', '$state', '$stateParams', 'Assuntos',
    '$modal',
    function ($scope, $rootScope, $state, $stateParams, Assuntos, $modal) {
        $scope.relevante = true;
        $scope.initDet = function () {
            waitingDialog.show();
            Assuntos.getById($stateParams.materia).then(function (materia) {
                $scope.materiaMae = materia;
                $scope.assunto = materia.materias[$stateParams.indice];
                $scope.assunto.status = "";
                $scope.assunto.qtdDatas = $scope.assunto.datas.length;
                var arrayStatus = [0,0,0,0];
                angular.forEach($scope.assunto.datas, function (data, dataIndex) {
                    data.status === "incompleto" ?
                        arrayStatus[1]++ : data.status === "revisar" ?
                        arrayStatus[2]++ : data.status === "completo" ?
                        arrayStatus[3]++ : arrayStatus[0]++;
                });
                for(var i = 0; i < arrayStatus.length; i++) {
                    arrayStatus[i] = Math.floor((arrayStatus[i] / $scope.assunto.qtdDatas) * 100);
                }
                $scope.assunto.status = arrayStatus[3] === 100 ? "completo" :
                    arrayStatus[2] === 100 ? "revisar" :
                    arrayStatus[1] === 100 ? "incompleto" : "";
                $scope.assunto.arrayStatus = arrayStatus;
                waitingDialog.hide();
            });
        };

        $scope.editar = function (indice, data) {
            $modal
                .open({
                    templateUrl: 'editarData.html',
                    controller: function ($scope, parentScope, indice, dataSelecionada) {
                        $scope.initEditar = function () {
                            $scope.Math = window.Math;
                            $scope.estudo = {
                                total: dataSelecionada.total,
                                acerto: dataSelecionada.acerto,
                                data: new Date(data.data),
                                tempo: new Date(dataSelecionada.tempo),
                                observacao: dataSelecionada.observacao,
                                status: data.status ? data.status : "incompleto"
                            };
                        };
                        $scope.confirmarEditar = function () {
                            $scope.$close(true);
                        };
                        $scope.cancelarEditar = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        },
                        indice: function () {
                            return indice;
                        },
                        dataSelecionada: function () {
                            return data;
                        }
                    }
                }).result.then(function () {

                }, function () {

                });
        };

        $scope.excluir = function (indice) {
            $modal
                .open({
                    templateUrl: 'confirmarExclusao.html',
                    controller: function ($scope, parentScope) {
                        $scope.relevante = true;
                        $scope.cancelarExclusao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarExclusao = function () {
                            parentScope.relevante = $scope.relevante;
                            $scope.$close(true);
                        };
                    },
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        }
                    }
                }).result.then(function () {
                    if ($scope.relevante) {

                    }
                    $scope.materiaMae.materias[$stateParams.indice].datas.splice(indice, 1);
                    $scope.materiaMae.$saveOrUpdate().then(function () {
                        $state.reload();
                    });
                }, function () {

                });
        };
    }]);