angular.module('estudos')
.directive("checkboxGroup", function () {
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            // Determine initial checked boxes
            if (scope.array.indexOf(scope.$parent.materia._id.$oid + "#" + scope.$eval(attrs.index)) !== -1) {
                elem[0].checked = true;
            }
            // Update array on click
            elem.bind('click', function () {
                var index = scope.array.indexOf(scope.$parent.materia._id.$oid + "#" + scope.$eval(attrs.index));
                // Add if checked
                if (elem[0].checked) {
                    if (index === -1) scope.array.push(scope.$parent.materia._id.$oid + "#" + scope.$eval(attrs.index));
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