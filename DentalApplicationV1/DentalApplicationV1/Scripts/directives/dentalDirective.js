dentalApp.directive('dirBodyContainer', dirBodyContainer);
dentalApp.directive('dirGenerateMenu', dirGenerateMenu);
function dirBodyContainer() {
    return {
        restrict: 'E',
        scope: { top: '=' },
        link: function (scope,element)
        {
            element.css({
                position: 'absolute',
                top: scope.top + 'px'
            })
        }
    }
}
function dirGenerateMenu() {
    //Directive that will generate user menu base on the value pass on it's data attribute 
    return {
        restrict: 'E',
        scope: {
            type: '='
        },
        controller: function ($http, $scope) {
            $http.get("/api/UserMenus?userTypeId=" + $scope.type)
            .success(function (data, status) {
                if (data.status == "SUCCESS")
                    $scope.data = data.objParam1;
            });
        },
        templateUrl: '/Directive/UserMenu'
    }
};