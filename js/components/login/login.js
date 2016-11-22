angular.module('estudos').controller('LoginController', ['$scope', '$rootScope', '$state',
    'Usuario', '$window',
    function ($scope, $rootScope, $state, Usuario, $window) {
        $scope.errorLogin = "";

        $scope.initLogin = function () {
            $scope.errorLogin = "";
            $scope.usuario = "";
            $scope.senha = "";
            var currentUser = angular.fromJson($window.sessionStorage.getItem('programaEstudosUsuarioLogado'));
            if (currentUser) {
                $rootScope.usuarioLogado = currentUser;
                $state.go('home');
            }
        };

        $scope.login = function () {
            $scope.errorLogin = "";
            var usuario = $scope.usuario;
            var senha = $scope.senha;

            Usuario.query({"usuario": usuario, "senha": senha}).then(function (usuarios) {
                if (usuarios[0]) {
                    $window.sessionStorage.setItem('programaEstudosUsuarioLogado', angular.toJson(usuarios[0]));
                    $rootScope.usuarioLogado = usuarios[0];
                    $state.go('home');
                } else {
                    $scope.errorLogin = "Usuario e/ou senha inválidos";
                }
            })
        };
    }]);