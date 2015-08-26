dentalApp.controller('IndexController', IndexController);
function IndexController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    console.log('Index');
    $scope.forRegistration = {
        "User": {
            "Username": "Patient2",
            "Password": "Patient2",
        },
        "FirstName": "Maiko",
        "MiddleName": "Nacua",
        "LastName": "Ybanez",
        "Gender": "M",
        "Height": 120,
        "Weight": 60,
        "BirthDate": "1994-05-12",
        "Address": "Bliss Pajac LLC",
        "CivilStatusId": 1,
        "Occupation": "None",
        "ContactNo": "09434364318",
        "EmailAddress": "kennethcarlybanez@gmail.com"
    }
    $scope.registrationRequest = function () {
        LxProgressService.circular.show('#5fa2db', '#progress');
        $http.post("/api/UserInformations", $scope.forRegistration)
        .success(function (data, status) {
            if (data.status == "SUCCESS")
                LxNotificationService.alert('System Message', data.message, 'Ok', function (answer) {});
            else
                LxNotificationService.error(data.message);
            LxProgressService.circular.hide();
        })
        .error(function (data, status) {
            LxProgressService.circular.hide();
            LxNotificationService.error(data.message);
        })
    };

};