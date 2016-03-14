angular.module('estudos').controller('HomeController', ['$scope', '$rootScope', '$state', '$cookies', '$http', '$filter', '$modal',
    'Assuntos',
    function($scope, $rootScope, $state, $cookies, $http, $filter, $modal, Assuntos){

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
            return (!$scope.searchtext || item.texto.toLowerCase().indexOf($scope.searchtext.toLowerCase()) !== -1);
        };

        $scope.searchFunc = function (item) {
            return (
                !$scope.searchtext ||
                item.assunto.toLowerCase().indexOf($scope.searchtext.toLowerCase()) !== -1 ||
                ($filter('filter')(item.materias, {texto: $scope.searchtext})).length > 0);
        };

        $scope.initHome = function () {

            waitingDialog.show();

            Assuntos.all().then(function (assuntos) {
                $scope.materiasUnificadas = assuntos;
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