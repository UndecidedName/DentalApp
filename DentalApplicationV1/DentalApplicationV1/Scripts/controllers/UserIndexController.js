dentalApp.controller("UserIndexController", UserIndexController);
function UserIndexController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    LxProgressService.circular.show('#5fa2db', '#progress');
    $scope.userInformation = [];
    $scope.civilStatusList = [];
    $scope.userTypeList = [];
    $scope.viewOnly = true;
    $scope.submitButtonText = "Edit";

    $scope.showDialog = function (dialogId) {
        LxDialogService.open(dialogId);
    };

    $scope.closeDate = function (dialogId) {
        var promise = $interval(function () {
            $scope.dataDefinitionMaster.DataItem.BirthDate = "";
            $scope.dataDefinitionMaster.DataItem.BirthDateHolder = $filter('date')($scope.dataDefinitionMaster.DataItem.BirthDateHolder, "MM/dd/yyyy");
            $scope.dataDefinitionMaster.DataItem.BirthDate = $scope.dataDefinitionMaster.DataItem.BirthDateHolder;
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

    $scope.initGenderList = function () {
        $scope.genderList = [
                           { Name: 'Male', Value: 'M' },
                           { Name: 'Female', Value: 'F' }
        ];
    };
    $scope.initGenderList();

    $scope.getCivilStatus = function () {
        $http.get('/api/CivilStatus')
        .success(function (data, status) {
            $scope.civilStatusList = angular.copy(data);

            //Initialize Civil Status
            for (var i = 0; i < $scope.civilStatusList.length; i++) {
                if ($scope.civilStatusList[i].Id == $rootScope.user.CivilStatusId) {
                    $scope.userInfo.CivilStatusHolder = $scope.civilStatusList[i];
                    i = $scope.civilStatusList.length;
                }
            }
            $scope.getUserType();
        })
    };
    $scope.getCivilStatus();

    $scope.getUserType = function () {
        $http.get('api/UserTypes?length=0&status=1')
        .success(function (data, status) {
            $scope.userTypeList = angular.copy(data);
            //Initialize Gender
            for (var i = 0; i < $scope.genderList.length; i++) {
                if ($scope.genderList[i].Value == $rootScope.user.Gender) {
                    $scope.userInfo.GenderDesc = $scope.genderList[i];
                    i = $scope.genderList.length;
                }
            }
            LxProgressService.circular.hide();
        })
    };

    $scope.userInfo = angular.copy($rootScope.user);

    $scope.userInfo.BirthDate = $filter('date')($scope.userInfo.BirthDate, 'MM-dd-yyyy');

    $scope.submit = function ()
    {
        if ($scope.submitButtonText == "Edit") {
            $scope.submitButtonText = "Save";
            $scope.viewOnly = false;
        }
        else {
            if ($scope.validateInput($scope.userInfo.FirstName))
                LxNotificationService.error('First Name is required.');
            else if ($scope.validateInput($scope.userInfo.MiddleName))
                LxNotificationService.error('Middle Name is required.');
            else if ($scope.validateInput($scope.userInfo.LastName))
                LxNotificationService.error('Last Name is required.');
            else if ($scope.validateInput($scope.userInfo.GenderDesc))
                LxNotificationService.error('Gender is required.');
            else if ($scope.validateInput($scope.userInfo.Height))
                LxNotificationService.error('Height is required.');
            else if ($scope.validateInput($scope.userInfo.Weight))
                LxNotificationService.error('Weight is required.');
            else if ($scope.validateInput($scope.userInfo.CivilStatusHolder))
                LxNotificationService.error('Civil Status is required.');
            else if ($scope.validateInput($scope.userInfo.Occupation))
                LxNotificationService.error('Occupation is required.');
            else if ($scope.validateInput($scope.userInfo.EmailAddress))
                LxNotificationService.error('Email Address is required.');
            else if ($scope.validateInput($scope.userInfo.Address))
                LxNotificationService.error('Address is required.');
            else if (!(/^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/.test($scope.userInfo.EmailAddress)))
                LxNotificationService.error('Invalid Email Address.');
            else {
                $scope.userInfo.CivilStatusId = $scope.userInfo.CivilStatusHolder.Id;
                console.log($scope.userInfo.CivilStatusId);
                $scope.userInfo.Gender = $scope.userInfo.GenderDesc.Value;
                $http.put("/api/UserInformations/" + $scope.userInfo.Id, $scope.userInfo)
                .success(function (response, status) {
                    if (response.status == "SUCCESS") {
                        $scope.submitButtonText = "Edit";
                        $scope.viewOnly = true;
                        $rootScope.user = angular.copy($scope.userInfo);
                    }
                    else
                        LxNotificationService.error(response.message);
                })
                .error(function (error, status) {
                    LxNotificationService.error(status);
                })
            }

        }
    }
}