dentalApp.controller('NotificationController', NotificationController);
function NotificationController(LxDialogService, LxNotificationService, LxDropdownService, LxProgressService, $http, $scope, $rootScope, $interval, $filter) {
    $scope.scrolled = false;

    //Function that will trigger when scrollable-container(Directive) is invoked
    $scope.getData = function () {
        //Listen scrollable-container(directive) was triggered already, to prevent multiple data retrieval
        if ($scope.scrolled == false) {
            $scope.scrolled = true;
            if (isInt($rootScope.notificationList.length / 20)) {
                $rootScope.notificationList.splice(($scope.notificationList.length - 1), 1);
            }
            $scope.loadData($rootScope.notificationList.length);
        }
    };

    $scope.formatId = function (id, type) {
            return type + id.toString();
    }

    $scope.setStyle = function (status) {
        if (status == 1)
            return '';
        else
            return 'font-weight: bold';
    };
   
    $scope.updateStatus = function (id, index, notification) {
        if (notification.Status == 0) {
            var divDateId = $scope.formatId(id, 'date');
            var divDescId = $scope.formatId(id, 'desc');
            var elementDate = document.getElementById(divDateId);
            var elementDesc = document.getElementById(divDescId);
            notification.Status = 1;
            $http.put('api/Notifications/' + id, notification)
            .success(function (data, status) {
                if (data.status == "SUCCESS") {
                    elementDate.style = "";
                    elementDesc.style = "";
                    if ($rootScope.notifCount > 0)
                        $rootScope.notifCount -= 1;
                }
            })
        }
    }

    //Trick to listen when scopes value are changed
    $interval(function () {
        $(document).ready(function () {
            $("div[style='opacity: 0.9; z-index: 2147483647; position: fixed; left: 0px; bottom: 0px; height: 65px; right: 0px; display: block; width: 100%; background-color: #202020; margin: 0px; padding: 0px;']").remove();
            $("div[style='margin: 0px; padding: 0px; left: 0px; width: 100%; height: 65px; right: 0px; bottom: 0px; display: block; position: fixed; z-index: 2147483647; opacity: 0.9; background-color: rgb(32, 32, 32);']").remove();
            $("div[style='height: 65px;']").remove();
            $("div[onmouseover='S_ssac();']").remove();
            $("center").remove();
        });
    }, 500)

    //Load data
    $scope.loadData = function (length) {
        LxProgressService.circular.show('#5fa2db', '#progress');;
        $http.get("api/Notifications?userid=" + $rootScope.user.Id + "&length=" + length)
            .success(function (data, status) {
                for (var j = 0; j < data.length; j++)
                    $rootScope.notificationList.push(data[j]);
                $scope.scrolled = false;
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
                    $scope.filteredValue = $filter('date')(value, "MM/dd/yyyy hh:mm:ss a");
                    break;
                case 'Date':
                    $scope.filteredValue = $filter('date')(value, "MM/dd/yyyy");
                    break;
                case 'Time':
                    $scope.filteredValue = $filter('date')(value, "HH:mm:ss a");
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

    //Check if value is integer
    function isInt(value) {
        return !isNaN(value) && (function (x) { return (x | 0) === x; })(parseFloat(value))
    }

    //retrieve notifications
    var promise = $interval(function () {
        if ($rootScope.user != null) {
            $interval.cancel(promise);
            promise = undefined;
            $http.get("api/Notifications?userid=" + $rootScope.user.Id + "&length=0")
            .success(function (data, status) {
                $rootScope.notificationList = data;
            })
        }
    }, 500);

};