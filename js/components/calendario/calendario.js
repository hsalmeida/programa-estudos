angular.module('estudos').controller('CalendarioController', ['$scope', '$rootScope', '$state',
    function($scope, $rootScope, $state){
        $scope.initCalendar = function () {
            moment.locale('pt-br');
            $scope.calendarView = "year";
            $scope.calendarDate = new Date();
            $scope.events = [];

        };
    }]);