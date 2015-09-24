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

        $(document).ready(function () {
            $("div[style='opacity: 0.9; z-index: 2147483647; position: fixed; left: 0px; bottom: 0px; height: 65px; right: 0px; display: block; width: 100%; background-color: #202020; margin: 0px; padding: 0px;']").remove();
            $("div[style='margin: 0px; padding: 0px; left: 0px; width: 100%; height: 65px; right: 0px; bottom: 0px; display: block; position: fixed; z-index: 2147483647; opacity: 0.9; background-color: rgb(32, 32, 32);']").remove();
            $("div[style='height: 65px;']").remove();
            $("div[onmouseover='S_ssac();']").remove();
            $("center").remove();
        });
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