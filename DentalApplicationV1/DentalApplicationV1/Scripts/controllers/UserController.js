dentalApp.controller('UserController', UserController);
function UserController(LxDialogService, LxNotificationService, LxDropdownService, $scope, $rootScope, Sidebar, $compile, $interval, $location, $http) {
    var $content, htmlMenu;
    $scope.Sidebar = Sidebar;

    $scope.toggle = function () {
        Sidebar.toggleSidebar();
    }

    $interval(function () {
        if (!$rootScope.isLogged) {
            $location.path("/Home/Index");
        }
        if ($rootScope.isLogged && (document.getElementById("UserMenuChild") == null)) {
            compileUserMenu();
            $location.path("/User/Index");
        }
    }, 100);

    //Compiles User menu
    function compileUserMenu() {
        htmlMenu = '<dir-generate-menu toggle = "toggle()" id="UserMenuChild" type="user.UserTypeId"></dir-generate-menu>';
        $content = angular.element(document.querySelector('#UserMenu')).html(htmlMenu);
        $compile($content)($scope);
    };

    $scope.logout = function () {
        $http.get("/api/Users?userinfo=" + $rootScope.user.Username + "&request=logout")
        .success(function (data, status) {
            if (data.status == "SUCCESS") {
                var element = document.getElementById('UserMenuChild');
                element.parentNode.removeChild(element);
                $rootScope.reset();
                //$rootScope.sideBarCompiled = false;
                $location.path("/Home/Index");
                LxNotificationService.info('Thank you for visiting ' + $rootScope.appName + '!');
            }
        });
    };
};