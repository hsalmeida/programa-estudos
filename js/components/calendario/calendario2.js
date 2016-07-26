angular.module('estudos').controller('Calendario2Controller', ['$scope', '$rootScope', '$state', 'Assuntos', '$modal',
    function ($scope, $rootScope, $state, Assuntos, $modal) {

        $scope.eventSources = [];

        $scope.initCalendar = function () {
            $scope.uiConfig = {
                calendar: {
                    lang: 'pt-br',
                    height: '100%',
                    editable: true,
                    header: {
                        left: 'year month agendaWeek agendaDay',
                        center: 'title',
                        right: 'today prev,next'
                    },
                    prev: 'btn'
                }
            };
        };

    }]);