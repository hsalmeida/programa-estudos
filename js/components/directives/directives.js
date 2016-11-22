angular.module('estudos')
    .directive(
    "mAppLoading",
    function ($animate) {
        // Return the directive configuration.
        return ({
            link: link,
            restrict: "C"
        });
        // I bind the JavaScript events to the scope.
        function link(scope, element, attributes) {
            // Due to the way AngularJS prevents animation during the bootstrap
            // of the application, we can't animate the top-level container; but,
            // since we added "ngAnimateChildren", we can animated the inner
            // container during this phase.
            // --
            // NOTE: Am using .eq(1) so that we don't animate the Style block.
            $animate.leave(element.children().eq(1)).then(
                function cleanupAfterAnimation() {
                    // Remove the root directive element.
                    element.remove();
                    // Clear the closed-over variable references.
                    scope = element = attributes = null;
                }
            );
        }
    }
)
    .directive('homeHeader', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'views/directives/home-header.html',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

            }]
        };
    })
    .directive('header', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'views/directives/header.html',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

            }]
        };
    })
    .directive('chartStackedBar', function (ChartJsFactory) {
        return new ChartJsFactory('StackedBar');
    })
    .directive("checkboxGroup", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                // Determine initial checked boxes
                if (scope.array.indexOf(
                        scope.$parent.materia._id.$oid + "#" + scope.$parent.materia.materias.indexOf(scope.assunto)
                    ) !== -1) {
                    elem[0].checked = true;
                }
                // Update array on click
                elem.bind('click', function () {
                    var index =
                        scope.array.indexOf(
                            scope.$parent.materia._id.$oid + "#" + scope.$parent.materia.materias.indexOf(scope.assunto)
                        );
                    // Add if checked
                    if (elem[0].checked) {
                        if (index === -1)
                            scope.array.push(
                                scope.$parent.materia._id.$oid + "#" + scope.$parent.materia.materias.indexOf(scope.assunto)
                            );
                    }
                    // Remove if unchecked
                    else {
                        if (index !== -1) scope.array.splice(index, 1);
                    }
                    // Sort and update DOM display
                    scope.$apply(scope.array.sort(function (a, b) {
                        return a - b
                    }));
                });
            }
        }
    });