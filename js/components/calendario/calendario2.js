angular.module('estudos').controller('Calendario2Controller', ['$scope', '$rootScope', '$state', 'Assuntos', '$modal',
    'uiCalendarConfig',
    function ($scope, $rootScope, $state, Assuntos, $modal, uiCalendarConfig) {

        $scope.events = [];
        $scope.eventSources = [$scope.events];

        $scope.initCalendar = function () {
            waitingDialog.show("Aguarde. Carregando calendário");
            getEvents();
            waitingDialog.hide();
            $scope.uiConfig = {
                calendar: {
                    lang: 'pt-br',
                    height: '100%',
                    editable: true,
                    header: {
                        left: 'month agendaWeek agendaDay',
                        center: '',
                        right: 'today prev,next'
                    },
                    views: {
                        month: {
                            titleFormat: 'MMM/YYYY'
                        },
                        agendaWeek: {
                            titleFormat: 'DD/MM/YYYY'
                        },
                        agendaDay: {
                            titleFormat: 'DD/MM/YYYY'
                        }
                    },
                    eventClick: $scope.eventoClicado,
                    viewRender: function (view, element) {
                        $scope.calendar2Title = view.title;
                        //getEvents();
                    },
                    events: $scope.events
                }
            };


        };

        $scope.eventoClicado = function (date, jsEvent, view) {
            $modal
                .open({
                    templateUrl: 'evt-detail.html',
                    controller: function ($scope, event) {
                        $scope.initDetail = function () {
                            $scope.event = date;
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

        function getEvents() {
            $scope.events = [];
            $scope.assuntos = [];
            var ativos = {
                "ativo": true
            };
            Assuntos.query(ativos).then(function (assuntos) {
                $scope.assuntos = assuntos;
                angular.forEach(assuntos, function (assunto, assuntoIndex) {
                    assunto.horasTotal = 0;
                    assunto.minutosTotal = 0;
                    angular.forEach(assunto.materias, function (materia, materiaIndex) {

                        angular.forEach(materia.datas, function (data, dataIndex) {

                            var textStatus = data.status ? data.status : "em andamento";
                            var tempoData = data.tempo === 0 ? 2 : new Date(data.tempo).getHours();
                            var minutoData = data.tempo === 0 ? 0 : new Date(data.tempo).getMinutes();
                            minutoData = minutoData === 0 ? "" : minutoData;

                            assunto.horasTotal += tempoData;
                            assunto.minutosTotal += Number(minutoData);

                            var inicioData = new Date(data.data);
                            inicioData.setTime(inicioData.getTime() - (tempoData * 60 * 60 * 1000));
                            var fimData = new Date(inicioData);
                            fimData.setTime(fimData.getTime() + (tempoData * 60 * 60 * 1000));

                            var evento = {
                                id: dataIndex,
                                title: materia.topico + ': ' + materia.texto + ' (' + textStatus + ')',
                                start: inicioData,
                                end: fimData,
                                editable: false,
                                color: assunto.cor,
                                topico: materia.topico,
                                texto: materia.texto,
                                statusMateria: data.status,
                                total: data.total,
                                acerto: data.acerto,
                                aproveitamento: data.aproveitamento,
                                horas: tempoData + "h" + minutoData,
                                obs: data.observacao,
                                inicio: inicioData
                            };
                            $scope.events.push(evento);
                        });
                    });
                    assunto.horasTotal += assunto.minutosTotal !== 0 ? assunto.minutosTotal / 60 : 0;
                });
            });
            $scope.eventSources = [$scope.events];
            /*
             $('#my-calendar').fullCalendar('removeEvents');
             $('#my-calendar').fullCalendar('addEventSource',$scope.events);
             */
        }

    }]);