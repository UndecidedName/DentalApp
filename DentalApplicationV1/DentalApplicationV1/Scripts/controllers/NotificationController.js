dentalApp.controller('NotificationController', NotificationController);
function NotificationController(LxDialogService, LxNotificationService, LxDropdownService, LxProgressService, $http, $scope, $rootScope, $interval, $filter) {
    $scope.getData = function () {
        $scope.loadData($rootScope.notificationList.length);
    }
    //Trick to listen when scopes value are changed
    $interval(function () {
    }, 500)

    //Load data
    $scope.loadData = function (length) {
        LxProgressService.circular.show('#5fa2db', '#progress');;
        $http.get("api/Notifications?userid=" + $rootScope.user.Id + "&length=" + length)
            .success(function (data, status) {
                for (var j = 0; j < data.length; j++)
                    $rootScope.notificationList.push(data[j]);
                LxProgressService.circular.hide();
            })
            .error(function (data, status) {
                LxProgressService.circular.hide();
                $scope.showformerror({ error: status });
            })
    };

    //Function that will format key value
    $scope.filterValue = function (value, index, type) {
        var type = type;
        if (value == null)
            $scope.filteredValue = "";
        else {
            switch (type) {
                case 'String':
                    $scope.filteredValue = $scope.properCase(value);
                    break;
                case 'String-Upper':
                    $scope.filteredValue = $scope.UpperCase(value);
                    break;
                case 'DateTime':
                    $scope.filteredValue = $filter('date')(value, "MM/dd/yyyy HH:mm:ss");
                    break;
                case 'Date':
                    $scope.filteredValue = $filter('date')(value, "MM/dd/yyyy");
                    break;
                case 'Time':
                    $scope.filteredValue = $filter('date')(value, "HH:mm:ss");
                    break;
                case 'Number':
                    $scope.filteredValue = value;
                    break;
                case 'Boolean':
                    if (value)
                        $scope.filteredValue = "Yes";
                    else
                        $scope.filteredValue = "No";
                    break;
                case 'Gender':
                    if (value == "F")
                        $scope.filteredValue = "Female";
                    else
                        $scope.filteredValue = "Male";
                    break;
                case 'Status-Approver':
                    if (value == 0)
                        $scope.filteredValue = "For Approval";
                    else if (value == 1)
                        $scope.filteredValue = "Approved";
                    else
                        $scope.filteredValue = "Disapproved";
                    break;
                case 'Status-Default':
                    if (value == 0)
                        $scope.filteredValue = "Open";
                    else if (value == 1)
                        $scope.filteredValue = "Closed";
                    break;
                case 'Status-Maintenance':
                    if (value == 0)
                        $scope.filteredValue = "Inactive";
                    else if (value == 1)
                        $scope.filteredValue = "Active";
                    break;
                case 'Formatted-Time':
                    var day = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + value;
                    $scope.filteredValue = $filter('date')(new Date(day).getTime(), "hh:mm a");
                    break;
                default:
                    $scope.filteredValue = value;
            }
        }
        return $scope.filteredValue;
    };

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
};