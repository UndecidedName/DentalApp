dentalApp.controller('HomeController', HomeController);
dentalApp.controller('UserController', UserController);
dentalApp.controller('AppointmentController', AppointmentController);
dentalApp.controller('SettingController', SettingController);
dentalApp.controller('NotificationController', NotificationController);
function HomeController(LxProgressService, LxDialogService, LxNotificationService, $scope, $rootScope, $interval, $location, $compile, $http, $cookies) {
    if (!$rootScope.isLogged)
        LxNotificationService.success('Welcome to ' + $rootScope.appName + '!');
    
    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $rootScope.browserWidth = false;
            $scope.loginModalStyle = "";
            $scope.loginModalHeader = "Smile"
        }
        else {
            $rootScope.browserWidth = true;
            $scope.loginModalStyle = "padding:0px 60px 0px 60px";
            $scope.loginModalHeader = $rootScope.appName + " Login Form"
        }
        if ($rootScope.isLogged)
            $location.path("/User/Index");
    }, 100);

    $scope.initUser = function() {
        $scope.userInfo = {
            username: null,
            password: null,
            rememberMe: null
        };
    };

    $scope.openLogin = function (dialogId) {
        LxProgressService.circular.hide();
        $scope.initUser();
        if (angular.isDefined($cookies.get('DentalUsername')))
        {
            $scope.userInfo.username = $cookies.get('DentalUsername')
            $scope.userInfo.password = $cookies.get('DentalPassword')
            $scope.userInfo.rememberMe = true;
        }
        LxDialogService.open(dialogId);
    };

    $scope.closeLogin = function (dialogId) {
        LxDialogService.close(dialogId);
        LxNotificationService.info('Have a nice day!');
    };

    $scope.scrollEndDialog = function () {
        LxNotificationService.info('Dialog scroll end!');
    };

    $scope.invalidateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    }

    $scope.loginRequest = function (dialogId) {
        LxProgressService.circular.show('#5fa2db', '#loginProgress');
        var param = $scope.userInfo.username + "," + $scope.userInfo.password;
        $http.get("/api/Users?userinfo=" + param.toString() + "&request=login")
        .success(function (data, status) {
            if (data.status == "SUCCESS") {
                $rootScope.isLogged = true;
                $rootScope.user = data.objParam1[0];
                LxNotificationService.info('Hello ' + $rootScope.user.FirstName + '!');
                $location.path("/User/Index");
                //Save user info in cookie
                if ($scope.userInfo.rememberMe == true) {
                    $cookies.put('DentalUsername', $scope.userInfo.username);
                    $cookies.put('DentalPassword', $scope.userInfo.password);
                }
                //remove user info cookie
                else {
                    if (angular.isDefined($cookies.get('DentalUsername'))) {
                        $cookies.remove('DentalUsername')
                        $cookies.remove('DentalPassword')
                    }
                }
                LxProgressService.circular.hide();
                LxDialogService.close(dialogId);
            }
            else {
                LxProgressService.circular.hide();
                LxNotificationService.error(data.message);
            }
        });
        
    };
};
function UserController(LxDialogService, LxNotificationService, LxDropdownService, $scope, $rootScope, Sidebar, $compile, $interval, $location, $http) {
    var $content, htmlMenu;
    $scope.Sidebar = Sidebar;

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
        htmlMenu = '<dir-generate-menu id="UserMenuChild" type="user.UserTypeId"></dir-generate-menu>';
        $content = angular.element(document.querySelector('#UserMenu')).html(htmlMenu);
        $compile($content)($scope);
    };

    $scope.logout = function () {
        $http.get("/api/Users?userinfo=" + $rootScope.user.Username + "&request=logout")
        .success(function (data, status) {
            if (data.status == "SUCCESS") {
                var element = document.getElementById('UserMenuChild');
                element.parentNode.removeChild(element);
                $rootScope.isLogged = false;
                $rootScope.user = null;
                $rootScope.sideBarCompiled = false;
                $location.path("/Home/Index");
                LxNotificationService.info('Thank you for visiting ' + $rootScope.appName + '!');
            }
        });
    };
};
function AppointmentController() {};
function SettingController() {};
function NotificationController(LxDialogService, LxNotificationService, LxDropdownService, $scope, $rootScope) {};