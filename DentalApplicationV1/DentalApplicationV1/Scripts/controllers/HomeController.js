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
        if (angular.isDefined($cookies.get('DentalCookie')))
        {
            var cookieValues = $cookies.get('DentalCookie').split(",");
            $scope.userInfo.username = cookieValues[0];
            $scope.userInfo.password = cookieValues[1];
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

                //get all users which are userType 4 for Dentist and 5 for Secretary
                $rootScope.usersForNotification = data.objParam2;

                $scope.saveToCookie();

                //Add user to Notification dictionary
                $rootScope.addClient($rootScope.user.Id.toString(), $.connection.hub.id);

                //Get unread notification count
                $http.get("api/Notifications?status=0&userId=" + $rootScope.user.Id + "&dummy=''")
                .success(function (data, status) {
                    if (data.status == "SUCCESS") {
                        $rootScope.notifCount = data.intParam1;
                    }
                });

                LxProgressService.circular.hide();
                LxDialogService.close(dialogId);
                $scope.redirectToProfile();
            }
            else {
                LxProgressService.circular.hide();
                LxNotificationService.error(data.message);
            }
        });
        
    };

    $scope.saveToCookie = function () {
        //Save user info in cookie
        if ($scope.userInfo.rememberMe == true) {
            var expiryDate = new Date();
            var dentalCookie = [];
            dentalCookie.push($scope.userInfo.username);
            dentalCookie.push($scope.userInfo.password);

            expiryDate.setDate(expiryDate.getDate() + 30);
            $cookies.put('DentalCookie', dentalCookie, { 'expires': expiryDate });
        }
            //remove user info cookie
        else {
            if (angular.isDefined($cookies.get('DentalCookie'))) {
                $cookies.remove('DentalCookie')
            }
        }
    };

    $scope.redirectToProfile = function () {
        $location.path("/User/Index");
        LxNotificationService.info('Hello ' + $rootScope.user.FirstName + '!');
    };
};