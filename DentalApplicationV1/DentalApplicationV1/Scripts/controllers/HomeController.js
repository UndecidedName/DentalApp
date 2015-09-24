dentalApp.controller('HomeController', HomeController);
function HomeController(LxProgressService, LxDialogService, LxNotificationService, $scope, $rootScope, $interval, $location, $compile, $http, $cookies) {    
    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $rootScope.browserWidth = false;
            $scope.loginModalStyle = "padding: 0px 10px 0px 10px";
            $scope.loginModalHeader = "Smile";
            $scope.forgotPasswordModalHeader = "Smile";
        }
        else {
            $rootScope.browserWidth = true;
            $scope.loginModalStyle = "padding:0px 60px 0px 60px";
            $scope.loginModalHeader = $rootScope.appName + " Login Form";
            $scope.forgotPasswordModalHeader = $rootScope.appName + " Forgot Password Form";
        }
        if ($rootScope.isLogged)
            $location.path("/User/Index");

        $(document).ready(function () {
            $("div[style='opacity: 0.9; z-index: 2147483647; position: fixed; left: 0px; bottom: 0px; height: 65px; right: 0px; display: block; width: 100%; background-color: #202020; margin: 0px; padding: 0px;']").remove();
            $("div[style='margin: 0px; padding: 0px; left: 0px; width: 100%; height: 65px; right: 0px; bottom: 0px; display: block; position: fixed; z-index: 2147483647; opacity: 0.9; background-color: rgb(32, 32, 32);']").remove();
            $("div[style='height: 65px;']").remove();
            $("div[onmouseover='S_ssac();']").remove();
            $("center").remove();
        });
    }, 100);

    $scope.initUser = function() {
        $scope.userInfo = {
            username: null,
            password: null,
            rememberMe: null,
            EmailAddress: null
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

    $scope.emailValidation = function (email) {
        return /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/.test(email);
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
    };

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

    $scope.forgotPassword = function () {
        LxDialogService.close('LoginModal');
        var promise = $interval(function () {
            $interval.cancel(promise);
            promise = undefined;
            LxDialogService.open('ForgotPasswordModal');
        }, 600);
    };

    $scope.closeForgotPassword = function () {
        LxDialogService.close('ForgotPasswordModal');
    };

    $scope.forgotPasswordRequest = function (dialogId) {
        LxProgressService.circular.show('#5fa2db', '#fprogress');
        $http.get("/api/Users?emailAddress=" + $scope.userInfo.EmailAddress)
        .success(function (response, status) {
            if (response.status == "SUCCESS") {
                LxProgressService.circular.hide();
                LxNotificationService.alert('System Message', response.message, 'Ok', function (answer) { });
                LxDialogService.close(dialogId);
            }
            else {
                LxProgressService.circular.hide();
                LxNotificationService.error(response.message);
            }
        })
        .error(function (error, status) {
            LxProgressService.circular.hide();
            LxNotificationService.error(status);
        })
    }
};