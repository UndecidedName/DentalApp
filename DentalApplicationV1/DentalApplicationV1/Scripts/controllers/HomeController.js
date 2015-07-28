dentalApp.controller('HomeController', HomeController);
function HomeController(LxProgressService, LxDialogService, LxNotificationService, $scope, $rootScope, $interval, $location, $compile, $http, $cookies) {    
    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $rootScope.browserWidth = false;
            $scope.loginModalStyle = "";
            $scope.loginModalHeader = "Smile";
        }
        else {
            $rootScope.browserWidth = true;
            $scope.loginModalStyle = "padding:0px 60px 0px 60px";
            $scope.loginModalHeader = $rootScope.appName + " Login Form";
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

    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    }

    $scope.loginRequest = function (dialogId) {
        LxProgressService.circular.show('#5fa2db', '#progress');
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
                    var expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30);
                    $cookies.put('DentalUsername', $scope.userInfo.username, { 'expires': expiryDate });
                    $cookies.put('DentalPassword', $scope.userInfo.password, { 'expires': expiryDate });
                }
                //remove user info cookie
                else {
                    if (angular.isDefined($cookies.get('DentalUsername'))) {
                        $cookies.remove('DentalUsername')
                        $cookies.remove('DentalPassword')
                    }
                }
                $rootScope.addClient($rootScope.user.Id.toString(), $.connection.hub.id);
                //retrieve notifications
                var promise = $interval(function () {
                    if ($rootScope.user != null) {
                        $http.get("api/Notifications?userid=" + $rootScope.user.Id + "&length=0")
                        .success(function (data, status) {
                            $rootScope.notificationList = data;
                            $interval.cancel(promise);
                            promise = undefined;
                        })
                    }
                }, 500);
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