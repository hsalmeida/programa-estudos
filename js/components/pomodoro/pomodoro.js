angular.module('estudos')
    .controller('PomodoroController', ['$scope', '$rootScope', '$state', 'Pomodoros',
    '$modal', '$q',
    function ($scope, $rootScope, $state, Assuntos, $modal, $q) {
        $scope.pomodoros = [];
        $scope.rodando = false;
        $scope.now = new Date();
        $scope.pomodoro = {
            "termino": {"$date" : new Date()},
            "nome": "",
            "minutos": 0,
            "segundos": 0,
            "usuario": $rootScope.usuarioLogado._id.$oid
        };
        $scope.initPomodoro = function () {
            $scope.rodando = false;
            $scope.timerObj = {
                interval: 1,
                countdown: 1500
            }
        };

        $scope.$on('timer-stopped', function (event, data){
            console.log("parou ", data );
        });

        $scope.$on('timer-reseted', function (event, data){
            console.log("stop ", data, $scope.pomodoro );
        });

        $scope.play = function () {
            $modal
            .open({
                templateUrl: 'criar-pomodoro.html',
                controller: function ($scope, parentScope) {
                    $scope.initCriarPomodoro = function () {

                        $scope.novoPomodoro = {
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
                        if($scope.formulario.$valid && $scope.novoPomodoro.nome) {
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
                $scope.$broadcast('timer-start');
            }, function () {

            });

        };

        $scope.pause = function () {
            $scope.rodando = false;
            $scope.$broadcast('timer-stop');
        };

        $scope.stop = function () {
            $scope.rodando = false;
            $scope.$broadcast('timer-reset');
        };

        $scope.finished = function () {
            console.log("terminou", $scope.pomodoro);
        };
    }]);