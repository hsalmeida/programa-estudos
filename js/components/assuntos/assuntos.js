angular.module('estudos').controller('AssuntosController', ['$scope', '$rootScope', '$state', 'Assuntos', '$uibModal', '$q',
    function ($scope, $rootScope, $state, Assuntos, $uibModal, $q) {
        $scope.logout = function () {
            $rootScope.$emit("logout", {});
        };
        $scope.assuntosInit = function () {
            waitingDialog.show("Aguarde. Carregando assuntos");
            var assuntoQuery = {
                "usuario": $rootScope.usuarioLogado._id.$oid
            };
            Assuntos.query(assuntoQuery, {sort: {"assunto": 1}}).then(function (assuntos) {
                for (var i = 0; i < assuntos.length; i++) {
                    if(!assuntos[i].listaordem) {
                        assuntos[i].listaordem = (i + 1);
                        assuntos[i].listaordemTmp = assuntos[i].listaordem;
                    } else {
                        assuntos[i].listaordemTmp = assuntos[i].listaordem;
                    }
                }
                $scope.materiasUnificadas = assuntos;
                waitingDialog.hide();
            });
        };

        $scope.salvar = function () {
            waitingDialog.show("Salvando alterações. Aguarde.");
            var proms = [];
            for (var i = 0; i < $scope.materiasUnificadas.length; i++) {
                $scope.materiasUnificadas[i].listaordem = $scope.materiasUnificadas[i].listaordemTmp;
                proms.push($scope.materiasUnificadas[i].$saveOrUpdate().then(function () {}));
            }
            $q.all(proms).then(function () {
                waitingDialog.hide();
            });
        };

        $scope.ativar = function (assunto) {
            assunto.ativo = true;
            /*
            assunto.$saveOrUpdate().then(function () {
                $state.reload();
            });
            */
        };

        $scope.desativar = function (assunto) {
            assunto.ativo = false;
            /*
            assunto.$saveOrUpdate().then(function () {
                $state.reload();
            });
            */
        };

        $scope.editar = function (assunto) {
            $state.go('assunto',{id: assunto._id.$oid});
        };

        $scope.excluir = function (assunto) {
            $uibModal
                .open({
                    templateUrl: 'exclusao.html',
                    controller: function ($scope) {
                        $scope.cancelarExclusao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarExclusao = function () {
                            assunto.$remove().then(function () {
                                $scope.$close(true);
                            });
                        };
                    }
                }).result.then(function () {
                    $state.reload();
                }, function () {

                });
        };

        $scope.criarAssunto = function () {
            $uibModal
                .open({
                    templateUrl: 'criar-assunto.html',
                    controller: function ($scope, assuntosDB) {

                        $scope.initCriar = function () {
                            $scope.assunto = new assuntosDB();
                            $scope.assunto.assunto = "";
                            $scope.assunto.usuario = $rootScope.usuarioLogado._id.$oid;
                            $scope.assunto.geral = {
                                "total": 0,
                                "acertos": 0,
                                "aproveitamento": 0
                            };
                            $scope.assunto.materias = [];
                            $scope.assunto.status = "";
                            $scope.assunto.qtdMaterias = 0;
                            $scope.assunto.arrayStatus = [100, 0, 0, 0];
                        };

                        $scope.cancelarCriacao = function () {
                            $scope.$dismiss();
                        };

                        $scope.confirmarCriacao = function () {
                            if($scope.assunto.assunto) {
                                $scope.assunto.$saveOrUpdate().then(function () {
                                    $scope.$close(true);
                                });
                            }
                        };
                    },
                    resolve: {
                        assuntosDB: function () {
                            return Assuntos;
                        }
                    }
                }).result.then(function () {
                    $state.reload();
                }, function () {});
        };
    }]);