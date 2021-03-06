app.directive('keyPress', keyPress);

function keyPress() {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.bind("keypress", function(event) {
                var keyCode = event.which || event.keyCode;
                if (keyCode == $attrs.code) {
                    $scope.$apply(function() {
                        $scope.$eval($attrs.keyPress, {$event: event});
                    });

                }
            });
        }
    };
}

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            element.bind('change', function(){
                scope.$apply(function(){
                    scope.$emit("fileSelected", { file: element[0].files[0] });
                });
            });
        }
    };
}]);

app.directive('ngRclick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

app.directive('errSrc', function() {
     return {
       link: function(scope, element, attrs) {
         element.bind('error', function() {
           if (attrs.src != attrs.errSrc) {
             attrs.$set('src', attrs.errSrc);
           }
         });
       }
     }
   });
