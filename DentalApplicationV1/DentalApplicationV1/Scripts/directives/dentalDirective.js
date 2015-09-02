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
                top: scope.top + 'px',
                width: '100%'
            })
        }
    }
}
function dirGenerateMenu() {
    //Directive that will generate user menu base on the value pass on it's data attribute 
    return {
        restrict: 'E',
        scope: {
            type: '=',
            toggle: '&'
        },
        controller: function ($http, $scope, $interval, LxProgressService, $compile) {
            LxProgressService.circular.show('#5fa2db', '#progressMenu');
            $scope.setSelected = function (selector, subMenuSelector, id) {
                var element = document.getElementById(subMenuSelector);
                if (element == null)
                {
                    var html = '<ul id="' + subMenuSelector + '">' +
                                    '<li ng-repeat="submenu in data | filter: { ParentId :' + id + '}" style="padding-left:20px;">' +
                                        '<a ui-sref="{{submenu.Url}}" class="sidebar-menu__link" ng-click="innerToggle()">{{submenu.Name}}</a>' +
                                    '</li>' +
                                '</ul>';
                    $content = angular.element(document.querySelector("#" + selector)).html(html);
                    $compile($content)($scope);
                    $scope.currentSubMenuSelector = subMenuSelector;
                }
                else
                    element.parentNode.removeChild(element);
            };
            $http.get("/api/V_UserMenu?userTypeId=" + $scope.type)
            .success(function (data, status) {
                $scope.parent = [];
                $scope.data = [];
                for (var j = 0; j < data.length; j++)
                {
                    if (data[j].ParentId == 0)
                        $scope.parent.push(data[j]);
                }
                for (var j = 0; j < data.length; j++)
                {
                    if (data[j].ParentId != 0)
                        $scope.data.push(data[j]);
                }
                LxProgressService.circular.hide();
            });
            LxProgressService.circular.hide();
            $scope.innerToggle = function () {
                $scope.toggle();
            }
        },
        templateUrl: '/Directive/UserMenu'
    }
};