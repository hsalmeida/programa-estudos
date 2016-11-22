angular.module('estudos').controller('CalendarioController', ['$scope', '$rootScope', '$state', 'Assuntos', '$modal',
    function($scope, $rootScope, $state, Assuntos, $modal){
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        $scope.initCalendar = function () {
            waitingDialog.show("Aguarde. Carregando calendário");
            $scope.events = [];
            $scope.assuntos = [];
            var ativos = {
                "ativo": true,
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            Assuntos.query(ativos).then(function (assuntos) {
                $scope.assuntos = assuntos;
                angular.forEach(assuntos, function (assunto, assuntoIndex) {
                    assunto.horasTotal = 0;
                    assunto.minutosTotal = 0;
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

                            var tempoData = 2;
                            var minutoData = 0;

                            if (data.tempo) {
                                var re = /^([0-9]{2}):([0-9]{2})$/gm;
                                var m = re.exec(data.tempo);
                                tempoData = Number(m[1]);
                                minutoData = Number(m[2]);
                            } else {
                                tempoData = 2;
                                minutoData = 0;
                            }

                            assunto.horasTotal += tempoData;
                            assunto.minutosTotal += Number(minutoData);
                            if(minutoData === 0) {
                                minutoData = "";
                            }

                            var inicioData = new Date(data.data);
                            inicioData.setTime(inicioData.getTime() - (tempoData * 60 * 60 * 1000));
                            var fimData = new Date(inicioData);
                            fimData.setTime(fimData.getTime() + (tempoData * 60 * 60 * 1000));

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
                                horas: tempoData + "h" + minutoData,
                                obs: data.observacao
                            };
                            $scope.events.push(evento);
                        });
                    });
                    assunto.horasTotal += assunto.minutosTotal !== 0 ? assunto.minutosTotal / 60 : 0;

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