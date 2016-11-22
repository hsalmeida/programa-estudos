angular.module('estudos').controller('CicloEstudoController', ['$scope', '$rootScope', '$state', 'Assuntos',
    function ($scope, $rootScope, $state, Assuntos) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        $scope.initChart = function () {
            waitingDialog.show("Aguarde. Carregando gráfico");
            var ativos = {
                "ativo": true,
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            Assuntos.query(ativos, {sort: {"assunto": 1}}).then(function (assuntos) {

                $scope.chartoptions = {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                };

                $scope.labels = [];
                $scope.data = [];
                $scope.assuntos = [];
                for (var z = 0; z < assuntos.length; z++) {
                    if (assuntos[z].horas) {
                        $scope.assuntos.push(assuntos[z]);
                        var re = /^([0-9]{2}):([0-9]{2})$/gm;
                        var m = re.exec(assuntos[z].horas);
                        var tempoData = Number(m[1]);
                        var minutoData = Number(m[2]);
                        if(minutoData !== 0) {
                            minutoData = minutoData / 60
                        }
                        tempoData += minutoData;
                        $scope.labels.push(assuntos[z].assunto);
                        $scope.data.push(tempoData);
                    }
                }

                waitingDialog.hide();

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };
    }]);