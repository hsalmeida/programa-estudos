angular.module('estudos').controller('CalendarioController', ['$scope', '$rootScope', '$state', 'Assuntos',
    function($scope, $rootScope, $state, Assuntos){

        $scope.initCalendar = function () {
            waitingDialog.show();
            $scope.events = [];
            Assuntos.all().then(function (assuntos) {
                angular.forEach(assuntos, function (assunto, assuntoIndex) {

                    angular.forEach(assunto.materias, function(materia, materiaIndex){

                        angular.forEach(materia.datas, function(data, dataIndex){

                            var status = "info";
                            if(data.status === "completo")
                                status = "success";
                            if(data.status === "revisar")
                                status = "warning";
                            if(data.status === "incompleto")
                                status = "important";

                            console.log(status);

                            var evento = {
                                title: '1. Matéria: ' + materia.topico + ' 2. Assunto: ' + materia.texto,
                                type: status,
                                startsAt: new Date(data.data),
                                editable: false,
                                deletable: false,
                                draggable: false,
                                resizable: true
                            };
                            $scope.events.push(evento);
                        });
                    });
                })
            });

            moment.locale('pt-br');
            $scope.calendarView = "year";
            $scope.calendarDate = new Date();

            waitingDialog.hide();
        };
    }]);