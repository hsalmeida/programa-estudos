angular.module('estudos').controller('VerMateriasController',
    function ($scope, assuntosDB, materia, $q, $rootScope, $uibModal) {

        $scope.searchtext = "";

        $scope.initVerMaterias = function () {
            $scope.materia = materia;
            $scope.selecionado = null;
        };
        $scope.subsearchFunc = function (item) {
            return (!$scope.searchtext ||
            item.texto.toLowerCase().indexOf($scope.searchtext.toLowerCase()) !== -1 ||
            item.concurso.toLowerCase().indexOf($scope.searchtext.toLowerCase()) !== -1);
        };

        $scope.estudar = function () {
            if ($scope.selecionado) {
                $uibModal
                    .open({
                        templateUrl: 'views/estudar/estudar.html',
                        controller: 'EstudarController',
                        resolve: {
                            assuntosDB: function () {
                                return assuntosDB;
                            },
                            arraySelecionados: function () {
                                return $scope.array;
                            },
                            materias: function () {
                                return $scope.materiasUnificadas;
                            }
                        }
                    }).result.then(function () {
                        $scope.recalcular();
                        $scope.initHome();
                    }, function () {
                    });
            }
        };


        $scope.cancelar = function () {
            $scope.$dismiss();
        };
    });