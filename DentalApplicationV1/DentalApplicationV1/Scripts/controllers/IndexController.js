dentalApp.controller('IndexController', IndexController);
function IndexController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $rootScope.browserWidth = false;
            $scope.registrationModalStyle = "padding: 0px 10px 0px 10px";
            $scope.registrationHeader = "Smile";
        }
        else {
            $rootScope.browserWidth = true;
            $scope.registrationModalStyle = "padding:0px 60px 0px 60px";
            $scope.registrationHeader = $rootScope.appName + " Registration Form";
        }
    }, 100);

    $scope.lock = false;
    $scope.showDiv = true;
    $scope.initUser = function () {
        $scope.userInfo = {
            "User": {"Username": null,
                "Password": null},
             "vpassword": null,
            "BirthDate": null,
            "GenderDesc":null,
            "BirthDateHolder": null,
            "FirstName": null,
            "MiddleName": null,
            "LastName": null,
            "EmailAddress": null
        };
    };

    $scope.initGenderList = function () {
        $scope.genderList = [
                           { Name: 'Male', Value: 'M' },
                           { Name: 'Female', Value: 'F' }
        ];
    };

    $scope.showDialog = function (dialogId) {
        if (dialogId != 'BirthDate')
            $scope.initUser();
        LxDialogService.open(dialogId);
    };

    $scope.closeDialog = function (dialogId) {
        document.getElementsByClassName("dialog-filter dialog-filter--is-shown").remove();
        LxDialogService.close(dialogId);
    };

    $scope.closeDate = function (dialogId) {
        var promise = $interval(function () {
            $scope.userInfo.BirthDate = "";
            $scope.userInfo.BirthDateHolder = $filter('date')($scope.userInfo.BirthDateHolder, "MM/dd/yyyy");
            $scope.userInfo.BirthDate = $scope.userInfo.BirthDateHolder;
            $interval.cancel(promise);
            promise = undefined;
            LxDialogService.close(dialogId);
        }, 100);
    };

    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    };

    $scope.emailValidation = function (email) {
        return /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/.test(email);
    };

    $scope.registrationRequest = function () {
        if ($scope.validateInput($scope.userInfo.User.Username))
            LxNotificationService.error('Username is required.');
        else if ($scope.validateInput($scope.userInfo.User.Password))
            LxNotificationService.error('Password is required.');
        else if ($scope.userInfo.User.Password != $scope.userInfo.vpassword)
            LxNotificationService.error("Password doesn't match.");
        else if ($scope.validateInput($scope.userInfo.FirstName))
            LxNotificationService.error('First Name is required.');
        else if ($scope.validateInput($scope.userInfo.MiddleName))
            LxNotificationService.error('Middle Name is required.');
        else if ($scope.validateInput($scope.userInfo.LastName))
            LxNotificationService.error('Last Name is required.');
        else if ($scope.validateInput($scope.userInfo.GenderDesc))
            LxNotificationService.error('Gender is required.');
        else if ($scope.validateInput($scope.userInfo.EmailAddress))
            LxNotificationService.error('Email Address is required.');
        else if(!(/^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/.test($scope.userInfo.EmailAddress)))
            LxNotificationService.error('Invalid Email Address.');
        else {
            $scope.userInfo.Gender = $scope.userInfo.GenderDesc.Value;
            LxProgressService.circular.show('#5fa2db', '#progress');
            $scope.lock = true;
            $http.post("/api/UserInformations", $scope.userInfo)
            .success(function (data, status) {
                if (data.status == "SUCCESS") {
                    LxNotificationService.alert('System Message', data.message, 'Ok', function (answer) {
                        $scope.hideDiv();
                    });
                }
                else
                    LxNotificationService.error(data.message);
                LxProgressService.circular.hide();
                $scope.lock = false;
            })
            .error(function (data, status) {
                LxProgressService.circular.hide();
                LxNotificationService.error(data.message);
                $scope.lock = false;
            })
        }
    };

    $scope.toggle = function () {
        $("#target").slideToggle(function () {
            $scope.initUser();
            $scope.showDiv = false;
        });
    };

    $scope.hideDiv = function () {
        $("#target").slideToggle(function () {
            $scope.initUser();
            $scope.showDiv = true;
        });
    };

    $rootScope.manipulateDOM();

    $scope.initGenderList();

    $scope.initUser();

    //Find specific character
    $scope.findCharacter = function (v, c) {
        for (var i = 0; i < v.length; i++) {
            if (v.charAt(i) == c)
                return true;
        }
        return false;
    };

    $scope.filterCharacters = function () {
        //Check if input contains letter only
        $("#firstname,#lastname,#middlename").keypress(function (key) {
            if ((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) && (key.charCode != 32)) return false;
        });

        //Check if input doesn't contain special character
        $("#password,#vpassword,#username").keypress(function (key) {
            if (!((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) && (key.charCode != 32)))
                return true;
            else {
                if (!(key.charCode < 48 || key.charCode > 57))
                    return true;
            }
            return false;
        });
    };

    $("#target").slideToggle();
};