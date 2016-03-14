angular.module('estudos').controller('EstudarController', function ($scope) {

    $scope.initEstudar = function () {

        $scope.estudo = {
            total: 1,
            acerto: 0,
            data: new Date(),
            observacao: ""
        };

        $scope.Math = window.Math;
    };

    $scope.confirmarEstudo = function () {

        console.log($scope.estudo.total);
        console.log($scope.estudo.acerto);
        console.log($scope.estudo.data);
        console.log($scope.estudo.observacao);
        console.log(Math.floor(($scope.estudo.acerto / $scope.estudo.total) * 100));

        $scope.$close(true);
    };
    $scope.cancelarEstudo = function () {
        $scope.$dismiss();
    };
});