angular.module('estudos')
    .controller('PomodoroController', ['$scope', '$rootScope', '$state', 'Pomodoros',
    '$uibModal', '$q', 'ngAudio', '$timeout',
    function ($scope, $rootScope, $state, Pomodoros, $uibModal, $q, ngAudio, $timeout) {
        $scope.pomodoros = [];
        $scope.pomodorosOntem = [];
        $scope.rodando = false;
        $scope.now = new Date();
        $scope.initPomodoro = function () {
            waitingDialog.show("Carregando Pomodoros. Aguarde.");
            $scope.pomodoro = {
                "data": "",
                "termino": "",
                "nome": "",
                "minutos": 0,
                "segundos": 0,
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            $scope.tipoPomodoro = {
                nome: "POMODORO",
                countdown: $rootScope.usuarioLogado.pomodoro.tempo,
                pomodoro: true
            };
            $scope.rodando = false;
            $scope.disablePlay = false;
            $scope.btnPausa = "PAUSA";
            $scope.glyphPausa = "glyphicon-pause";
            $scope.audio = ngAudio.load('js/components/pomodoro/alarm.mp3');
            $scope.timerObj = {
                interval: 1000,
                countdown: $scope.tipoPomodoro.countdown
            };
            $scope.$broadcast('timer-set-countdown-seconds', $scope.timerObj.countdown);
            var ontem = moment().subtract(1, 'days');
            $scope.ontemObj = ontem.toDate();
            var pomoOntemQuery = {
                data: ontem.format('YYYYMMDD'),
                usuario: $rootScope.usuarioLogado._id.$oid
            };
            Pomodoros.query(pomoOntemQuery).then(function (pomodorosOntem) {
                $scope.pomodorosOntem = pomodorosOntem;
            });
            var pomoQuery = {
                data: moment().format('YYYYMMDD'),
                usuario: $rootScope.usuarioLogado._id.$oid
            };
            Pomodoros.query(pomoQuery).then(function (pomodoros) {
                $scope.pomodoros = pomodoros;
                waitingDialog.hide();
            });
        };

        $scope.btnPomodoro = function () {
            $scope.tipoPomodoro = {
                nome: "POMODORO",
                countdown: $rootScope.usuarioLogado.pomodoro.tempo,
                pomodoro: true
            };

            $scope.timerObj.countdown = $scope.tipoPomodoro.countdown;
            $scope.$broadcast('timer-set-countdown-seconds', $scope.timerObj.countdown);

        };
        $scope.pausaCurta = function () {
            $scope.tipoPomodoro = {
                nome: "PAUSA CURTA",
                countdown: $rootScope.usuarioLogado.pomodoro.curta,
                pomodoro: false
            };
            $scope.timerObj.countdown = $scope.tipoPomodoro.countdown;
            $scope.$broadcast('timer-set-countdown-seconds', $scope.timerObj.countdown);

        };
        $scope.pausaLonga = function () {
            $scope.tipoPomodoro = {
                nome: "PAUSA LONGA",
                countdown: $rootScope.usuarioLogado.pomodoro.longa,
                pomodoro: false
            };

            $scope.timerObj.countdown = $scope.tipoPomodoro.countdown;
            $scope.$broadcast('timer-set-countdown-seconds', $scope.timerObj.countdown);

        };

        $scope.$on('timer-stopped', function (event, data){
            console.log("parou ", data );
        });

        $scope.$on('timer-reseted', function (event, data){
            if($scope.tipoPomodoro.pomodoro) {
                var mdiff = moment((1500000 - data.millis));
                $scope.pomodoro.segundos = mdiff.format("s");
                $scope.pomodoro.minutos = mdiff.format("m");
                $scope.pomodoro.termino = moment().format("HH[h]mm");
                console.log($scope.pomodoro);
                var pomodb = new Pomodoros();
                pomodb = angular.merge(pomodb, $scope.pomodoro);
                pomodb.$saveOrUpdate().then(function () {
                    $scope.initPomodoro();
                });
            }
        });

        $scope.personalizar = function () {
            $uibModal
                .open({
                    templateUrl: 'personalizar-pomodoro.html',
                    controller: function ($scope, $rootScope, parentScope, Usuario, $window) {
                        $scope.tempo = 0;
                        $scope.curta = 0;
                        $scope.longa = 0;
                        $scope.initConfigPomodoro = function () {
                            $scope.salvando = false;
                            $scope.tempo = ($rootScope.usuarioLogado.pomodoro.tempo / 60);
                            $scope.curta = ($rootScope.usuarioLogado.pomodoro.curta / 60);
                            $scope.longa = ($rootScope.usuarioLogado.pomodoro.longa / 60);
                        };

                        $scope.cancelarCriacao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarConfig = function () {
                            if ($scope.formulario.$valid) {
                                $scope.salvando = true;
                                Usuario.getById($rootScope.usuarioLogado._id.$oid).then(function (usuario) {
                                    usuario.pomodoro.tempo = ($scope.tempo * 60);
                                    usuario.pomodoro.curta = ($scope.curta * 60);
                                    usuario.pomodoro.longa = ($scope.longa * 60);

                                    usuario.$saveOrUpdate().then(function () {
                                        $window.sessionStorage.setItem('programaEstudosUsuarioLogado', angular.toJson(usuario));
                                        $rootScope.usuarioLogado = usuario;
                                        $scope.$close(true);
                                    });
                                });
                            }
                        };
                    },
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        }
                    }
                }).result.then(function () {
                    $scope.initPomodoro();
            }, function () {

            });
        };

        $scope.play = function () {

            if($scope.tipoPomodoro.pomodoro) {

                $uibModal
                    .open({
                        templateUrl: 'criar-pomodoro.html',
                        controller: function ($scope, parentScope) {
                            $scope.initCriarPomodoro = function () {

                                $scope.novoPomodoro = {
                                    "data": moment().format('YYYYMMDD'),
                                    "termino": null,
                                    "nome": "",
                                    "minutos": 0,
                                    "segundos": 0,
                                    "usuario": $rootScope.usuarioLogado._id.$oid
                                };
                            };

                            $scope.cancelarCriacao = function () {
                                $scope.$dismiss();
                            };

                            $scope.confirmarInicio = function () {
                                if ($scope.formulario.$valid && $scope.novoPomodoro.nome) {
                                    parentScope.pomodoro = $scope.novoPomodoro;
                                    $scope.$close(true);
                                }
                            };
                        },
                        resolve: {
                            parentScope: function () {
                                return $scope;
                            }
                        }
                    }).result.then(function () {
                    $scope.rodando = true;
                    $scope.disablePlay = true;
                    $scope.$broadcast('timer-start');
                }, function () {

                });
            } else {
                $scope.rodando = true;
                $scope.disablePlay = true;
                $scope.$broadcast('timer-start');
            }
        };

        $scope.pause = function () {
            console.log($scope.rodando);
            if($scope.rodando) {
                $scope.btnPausa = "RETOMAR";
                $scope.glyphPausa = "glyphicon-play";
                $scope.rodando = false;
                $scope.$broadcast('timer-stop');
            } else {
                $scope.btnPausa = "PAUSA";
                $scope.glyphPausa = "glyphicon-pause";
                $scope.rodando = true;
                $scope.$broadcast('timer-resume');
            }
        };

        $scope.stop = function () {
            $scope.rodando = false;
            $scope.disablePlay = false;
            $scope.$broadcast('timer-reset');
        };

        $scope.finished = function () {
            $scope.audio.play();
            if($scope.tipoPomodoro.pomodoro) {
                //terminou um pomodoro e nao uma pausa
                $scope.pomodoro.segundos = 0;
                $scope.pomodoro.minutos = 25;
                $scope.pomodoro.termino = moment().format("HH[h]mm");
                var pomodb = new Pomodoros();
                pomodb = angular.merge(pomodb, $scope.pomodoro);
                pomodb.$saveOrUpdate().then(function () {
                    $timeout(function () {
                        $scope.initPomodoro();
                    }, 3000);
                });
            }
            console.log("terminou", $scope.pomodoro);
        };
    }]);