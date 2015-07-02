dentalApp.controller('HomeController', HomeController);
dentalApp.controller('UserController', UserController);
dentalApp.controller('AppointmentController', AppointmentController);
dentalApp.controller('SettingController', SettingController);
dentalApp.controller('NotificationController', NotificationController);
function HomeController(LxDialogService, LxNotificationService, $scope, $rootScope, $interval, $location, $compile) {
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

    $scope.openLogin = function (dialogId) {
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
        $rootScope.isLogged = true;
        console.log('Logged');
        $rootScope.userType = 1;
        $scope.firstname = "Carl";
        LxNotificationService.info('Hello ' + $scope.firstname + '!');
        $location.path("/User/Index");
        LxDialogService.close(dialogId);
        
    };

    $scope.logout = function () {
        var element = document.getElementById('UserMenuChild');
        element.parentNode.removeChild(element);
        $rootScope.isLogged = false;
        $rootScope.userType = null;
        $rootScope.sideBarCompiled = false;
        $location.path("/Home/Index");
        LxNotificationService.info('Thank you for visiting ' + $rootScope.appName + '!');
    };

};
function UserController(LxDialogService, LxNotificationService, LxDropdownService, $scope, $rootScope, Sidebar, $compile, $interval, $location) {
    var $content, htmlMenu;
    $scope.Sidebar = Sidebar;

    $interval(function () {
        if (!$rootScope.isLogged) {
            $location.path("/Home/Index");
        }
        if ($rootScope.isLogged && !$rootScope.sideBarCompiled) {
            compileUserMenu();
            $rootScope.sideBarCompiled = true;
        }
    }, 100);

    //Compiles User menu
    function compileUserMenu() {
        htmlMenu = '<dir-generate-menu id="UserMenuChild" type="userType"></dir-generate-menu>';
        $content = angular.element(document.querySelector('#UserMenu')).html(htmlMenu);
        $compile($content)($scope);
    };
};
function AppointmentController() {};
function SettingController() {};
function NotificationController(LxDialogService, LxNotificationService, LxDropdownService, $scope, $rootScope) {};