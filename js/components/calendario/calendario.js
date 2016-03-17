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
                            var textStatus = data.status ? data.status : "em andamento";
                            if(data.status === "completo")
                                status = "success";
                            if(data.status === "revisar")
                                status = "warning";
                            if(data.status === "incompleto")
                                status = "important";
                            var MILLISECS_PER_HOUR = 60 /* min/hour */ * 60 /* sec/min */ * 1000 /* ms/s */;

                            var inicioData = new Date(data.data);
                            inicioData.setHours(1);
                            var fimData = new Date(data.data);
                            fimData.setHours(23);

                            var evento = {
                                title: '• Matéria: ' + materia.topico + ' • Assunto: ' + materia.texto + ' (' + textStatus + ')',
                                type: status,
                                startsAt: inicioData,
                                endsAt: fimData,
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