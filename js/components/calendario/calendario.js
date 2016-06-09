angular.module('estudos').controller('CalendarioController', ['$scope', '$rootScope', '$state', 'Assuntos', '$modal',
    function($scope, $rootScope, $state, Assuntos, $modal){

        $scope.initCalendar = function () {
            waitingDialog.show("Aguarde. Carregando calendário");
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
                                title: '•' + materia.topico + ': •' + materia.texto + ' (' + textStatus + ')',
                                type: status,
                                startsAt: inicioData,
                                endsAt: fimData,
                                editable: false,
                                deletable: false,
                                draggable: false,
                                resizable: true,
                                topico: materia.topico,
                                texto: materia.texto,
                                statusMateria: data.status,
                                total: data.total,
                                acerto: data.acerto,
                                aproveitamento: data.aproveitamento,
                                obs: data.observacao
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

        $scope.eventClicked = function (event) {
            $modal
                .open({
                    templateUrl: 'evt-detail.html',
                    controller: function ($scope, event) {
                        $scope.initDetail = function () {
                            $scope.event = event;
                        };
                        $scope.fechar = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        event: function () {
                            return event;
                        }
                    }
                }).result.then(function () {}, function () {});
        };

    }]);