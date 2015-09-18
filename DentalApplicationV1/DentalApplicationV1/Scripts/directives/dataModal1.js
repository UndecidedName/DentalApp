dentalApp.directive('dirDataModal1', dirDataModal1);
function dirDataModal1() {
    return {
        restrict: 'E',
        scope: {
            datadefinition: '=', /*Properties
                                    Header      - Header of the data modal
                                    Key         - Keys of the data modal  
                                    DataList      - Source of data modal
                                    DataItem    - Return value of the data moda
                                    CurrentLength - Contains the current length of the data list
                                    APIUrl      - Contains the API Url for data retrieval
                                    Dialog      - DialogId
                                */
            filterdefinition: '=',      /*
                                            Url     - Contains the API Url for Filter
                                            Source  - Contains the data needed for filtering such as Label, Property, Values and Type
                                        */
            otheractions: '&',
            closecontainer: '&',
            showformerror: '&'
        },
        templateUrl: 'Directive/DataModal1',
        controller: function ($scope, $http, $interval, $filter, $parse, $compile, LxProgressService, LxDialogService) {
            var stop;
            $scope.sortByDesc = true;
            $scope.sortByAsc = false;
            $scope.criteria = $scope.datadefinition.Keys[0];
            $scope.selectedIndex = null;
            $scope.filteredValue = "";
            $scope.showClose = false;
            $scope.filterStatus = false;
            $scope.defaultGetUrl = $scope.datadefinition.APIUrl[0];

            $scope.setFilterVariables = function () {
                $scope.filterParameters = { "Property": null, "Value": null, "Value2": null };
                $scope.filteredData = { "Definition": $scope.filterdefinition.Source[0] };
                $scope.filteredStatus = { "Definition": undefined };
                $scope.searchValue = "";
                $scope.showFilterDate = false;
                $scope.showFilterDropDown = false;
                $scope.showFilterText = true;
                $scope.filterDate = {
                    "FromDate": $filter('date')(new Date() - 1, "MM/dd/yyyy"),
                    "FromDateHolder": $filter('date')(new Date() - 1, "MM/dd/yyyy"),
                    "ToDate": $filter('date')(new Date() - 1, "MM/dd/yyyy"),
                    "ToDateHolder": $filter('date')(new Date() - 1, "MM/dd/yyyy")
                }
                $scope.filterTime = {
                    "FromTime": $filter('date')((new Date() - 1), "hh:mm a"),
                    "FromTimeHolder": undefined,
                    "ToTime": $filter('date')((new Date() - 1), "hh:mm a"),
                    "ToTimeHolder": undefined,
                    "FromSeconds": new Date((new Date() - 1)).getTime(),
                    "ToSeconds": new Date((new Date() - 1)).getTime()
                }
            };

            //Set the filter variables default value
            $scope.setFilterVariables();

            //Get data using the filtered criteria
            $scope.submitFilteredData = function () {
                var flag = false;
                $scope.filterParameters.Value = "";
                $scope.filterParameters.Value2 = "";
                $scope.filterParameters.Property = $scope.filteredData.Definition.Property;
                switch ($scope.filteredData.Definition.Type) {
                    case "Date":
                        if ($scope.filterDate.FromDate <= $scope.filterDate.ToDate) {
                            $scope.filterParameters.Value = $scope.filterDate.FromDate;
                            $scope.filterParameters.Value2 = $scope.filterDate.ToDate;
                            flag = true;
                        }
                        else
                            $scope.showformerror({ error: "End Date must be beyond the Start Date." });
                        break;
                    case "DropDown":
                        if (angular.isDefined($scope.filteredStatus.Definition)) {
                            $scope.filterParameters.Value = $scope.filteredStatus.Definition.Value;
                            flag = true;
                        }
                        else
                            $scope.showformerror({ error: ($scope.filteredData.Definition.Label + " is required.") });
                        break;
                    case "Time":
                        if ($scope.filterTime.FromSeconds < $scope.filterTime.ToSeconds) {
                            $scope.filterParameters.Value = $filter('date')(new Date($scope.filterTime.FromSeconds), "HH:mm")
                            $scope.filterParameters.Value2 = $filter('date')(new Date($scope.filterTime.ToSeconds), "HH:mm")
                            flag = true;
                        } else
                            $scope.showformerror({ error: "From time must be less than to To time." });
                        break;
                        //Default Type
                    default:
                        if ($scope.searchValue != "") {
                            $scope.filterParameters.Value = "";
                            for (var i = 0; i < $scope.searchValue.length; i++) {
                                if ($scope.searchValue.charAt(i) == ' ')
                                    $scope.filterParameters.Value += '%20';
                                else
                                    $scope.filterParameters.Value += $scope.searchValue.charAt(i);
                            }
                            flag = true;
                        }
                        else
                            $scope.showformerror({ error: ($scope.filteredData.Definition.Label + " is required.") });
                        break;
                }
                if (flag == true) {
                    $scope.datadefinition.DataList = [];
                    $scope.datadefinition.CurrentLength = $scope.datadefinition.DataList.length;
                    $scope.datadefinition.APIUrl[0] = $scope.filterdefinition.Url +
                                                      "&property=" + $scope.filterParameters.Property +
                                                      "&value=" + $scope.filterParameters.Value +
                                                      "&value2=" + $scope.filterParameters.Value2;
                    $scope.actionForm('Load');
                }
            };

            //Show filter Date/Time Modal
            $scope.showDialog = function (dialogId) {
                if (dialogId == "FilteredFromTime") {
                    $scope.filterTime.FromTime = $scope.filterTime.FromTimeHolder;
                }
                else if (dialogId == "FilteredToTime") {
                    $scope.filterTime.ToTime = $scope.filterTime.ToTimeHolder;
                }
                LxDialogService.open(dialogId);
            };

            //Close filter From Date modal
            $scope.closeFilteredFromDate = function (dialogId) {
                LxDialogService.close(dialogId);
                var promise = $interval(function () {
                    $scope.filterDate.FromDate = "";
                    $scope.filterDate.FromDateHolder = $filter('date')($scope.filterDate.FromDateHolder, "MM/dd/yyyy");
                    $scope.filterDate.FromDate = $scope.filterDate.FromDateHolder;
                    $interval.cancel(promise);
                    promise = undefined;
                    LxDialogService.close(dialogId);
                }, 100);
            };

            //Close filter time
            $scope.closeFilteredTime = function (dialogId) {
                if (dialogId == 'FilteredFromTime') {
                    var promise = $interval(function () {
                        //convert the selected time to seconds
                        $scope.filterTime.FromSeconds = new Date($scope.filterTime.FromTimeHolder).getTime();
                        //format the converted time for display
                        $scope.filterTime.FromTime = $filter('date')(new Date($scope.filterTime.FromSeconds), "hh:mm a");
                        $interval.cancel(promise);
                        promise = undefined;
                        LxDialogService.close(dialogId);
                    }, 100);
                }
                else {
                    var promise = $interval(function () {
                        //convert the selected time to seconds
                        $scope.filterTime.ToSeconds = new Date($scope.filterTime.ToTimeHolder).getTime();
                        //format the converted time for display
                        $scope.filterTime.ToTime = $filter('date')(new Date($scope.filterTime.ToSeconds), "hh:mm a");
                        $interval.cancel(promise);
                        promise = undefined;
                        LxDialogService.close(dialogId);
                    }, 100);
                }
            };

            //Close filter To Date modal
            $scope.closeFilteredToDate = function (dialogId) {
                var promise = $interval(function () {
                    $scope.filterDate.ToDate = "";
                    $scope.filterDate.ToDateHolder = $filter('date')($scope.filterDate.ToDateHolder, "MM/dd/yyyy");
                    $scope.filterDate.ToDate = $scope.filterDate.ToDateHolder;
                    $interval.cancel(promise);
                    promise = undefined;
                    LxDialogService.close(dialogId);
                }, 100);
            };

            $scope.getData = function () {
                if ($scope.datadefinition.CurrentLength != $scope.datadefinition.DataList.length) {
                    $scope.actionForm('Load');
                    $scope.datadefinition.CurrentLength = $scope.datadefinition.DataList.length;
                }
            };

            $scope.properCase = function (input) {
                var words = input.split(' ');
                for (var i = 0; i < words.length; i++) {
                    words[i] = words[i].toLowerCase(); // lowercase everything to get rid of weird casing issues
                    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
                }
                return words.join(' ');
            };

            //Function that format a string value to UpperCase(Ex. FASTCARGO)
            $scope.UpperCase = function (input) {
                var value = input.toUpperCase();
                return value;
            };

            //Function that will format the header name(Ex. User_Name to User Name)
            $scope.filterHeader = function (input) {
                var value = input.split("_");
                var finalValue = "";
                if (value.length > 1) {
                    for (var i = 0; i < value.length; i++)
                        finalValue = finalValue + " " + value[i];
                }
                else
                    finalValue = input;
                return finalValue;
            };

            //Function that will format key value
            $scope.filterValue = function (value, index) {
                var type = $scope.datadefinition.Type[index];
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
                            $scope.filteredValue = $filter('date')(value, "MM/dd/yyyy HH:mm:ss a");
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
                        case 'Decimal':
                            $scope.filteredValue = $filter('number')(value, 4);
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
                            var day = new Date().getMonth() + "/" + new Date().getDate() + "/" + new Date().getFullYear() + " " + value;
                            $scope.filteredValue = $filter('date')(new Date(day).getTime(), "hh:mm a");
                            break;
                        case 'Password':
                            $scope.filteredValue = "";
                            for (var i = 0; i < value.length; i++)
                                $scope.filteredValue += '*';
                            break;
                            break;
                        default:
                            $scope.filteredValue = value;
                    }
                }
                return $scope.filteredValue;
            };

            //Load data
            $scope.loadData = function (length) {
                LxProgressService.circular.show('#5fa2db', '#progress');
                var url = "";
                var apiUrlSplit = $scope.datadefinition.APIUrl[0].split(" ");
                url = apiUrlSplit[0] + length;
                for (var i = 1; i < apiUrlSplit.length; i++)
                    url = url + apiUrlSplit[i];
                $http.get(url)
                    .success(function (data, status) {
                        for (var j = 0; j < data.length; j++)
                            $scope.datadefinition.DataList.push(data[j]);
                        LxProgressService.circular.hide();
                    })
                    .error(function (data, status) {
                        LxProgressService.circular.hide();
                        $scope.showformerror({ error: status });
                    })
            };

            //Process Sorting
            $scope.processSorting = function (criteria) {
                //Ascending
                if ($scope.sortByDesc == true) {
                    $scope.sortByAsc = true;
                    $scope.sortByDesc = false;
                    criteria = criteria;
                }
                    //Descending
                else {
                    $scope.sortByAsc = false;
                    $scope.sortByDesc = true;
                    criteria = '-' + criteria;
                }
                $scope.criteria = criteria;
            };

            //search data
            $scope.getRecord = function (data) {
                $scope.datadefinition.DataItem = data;
            };

            $scope.change = function () {
                $scope.showClose = true;
                if ($scope.search == "") {
                    $scope.showClose = false;
                }
            };

            //Manage user actions
            $scope.actionForm = function (action) {
                //It should be outside of the PreAction statement
                if (action == 'Load') {
                    if ($scope.otheractions({ action: 'PreLoadAction' })) {
                        if ($scope.datadefinition.CurrentLength == 0) {
                            $scope.loadData($scope.datadefinition.DataList.length);
                        }
                        else {
                            if ($scope.datadefinition.CurrentLength == 20)
                                $scope.datadefinition.DataList.splice(($scope.datadefinition.DataList.length - 1), 1);
                        }
                    }
                    //set interval to make sure that the get call returns data before triggering some actions
                    stop = $interval(function () {
                        if ($scope.datadefinition.DataList.length > 0) {
                            $interval.cancel(stop);
                            $scope.datadefinition.CurrentLength = 0;
                            stop = undefined;
                            $scope.otheractions({ action: 'PostLoadAction' });
                            $scope.otheractions({ action: 'PostAction' });
                        }
                    }, 100);
                }

                if (action == 'Refresh') {
                    //Initialize the API Url base on the filtered data if filter is enable
                    if ($scope.filterStatus == true)
                        $scope.datadefinition.APIUrl[0] = $scope.filterdefinition.Url +
                                                      "&property=" + $scope.filterParameters.Property +
                                                      "&value=" + $scope.filterParameters.Value +
                                                      "&value2=" + $scope.filterParameters.Value2;
                    $scope.datadefinition.DataList = [];
                    if ($scope.otheractions({ action: 'PreLoadAction' }))
                        $scope.loadData(0);
                    //set interval to make sure that the get call returns data before triggering some actions
                    stop = $interval(function () {
                        if ($scope.datadefinition.DataList.length > 0) {
                            $interval.cancel(stop);
                            $scope.datadefinition.CurrentLength = 0;
                            stop = undefined;
                            $scope.otheractions({ action: 'PostLoadAction' });
                            $scope.otheractions({ action: 'PostAction' });
                        }
                    }, 100);
                }
            };

            //Listener that will check if user Submit an action
            $interval(function () {
                if ($scope.filterStatus == false)
                    $scope.datadefinition.APIUrl[0] = $scope.defaultGetUrl;
                var width = window.innerWidth;
                if (width < 1030) {
                    $scope.menuPosition = "left";
                    $scope.criteriaStyle = "";
                    $scope.searchValueStyle = "";
                    $scope.searchDateTimeStyle = "";
                    $scope.searchStyle = "";
                    $scope.filterContainerStyle = "";
                    $scope.checkBoxStyle = "";
                }
                else {
                    $scope.menuPosition = "right";
                    $scope.criteriaStyle = "width: 250px;";
                    $scope.searchValueStyle = "width: 400px; padding-left:10px;";
                    $scope.searchDateTimeStyle = "width: 200px; padding-left:10px;";
                    $scope.searchStyle = "width:100px;padding-left:10px; padding-top:35px;";
                    $scope.filterContainerStyle = "padding-left:10px;";
                    $scope.checkBoxStyle = "padding-left:10px;";
                }
                if (angular.isDefined($scope.filteredData.Definition)) {
                    if ($scope.filteredData.Definition.Type == 'Date') {
                        $scope.showFilterDate = true;
                        $scope.showFilterText = false;
                        $scope.showFilterDropDown = false
                        $scope.showFilterTime = false;
                        $scope.filteredStatus = { "Definition": undefined };
                    }
                    else if ($scope.filteredData.Definition.Type == 'Time') {
                        $scope.showFilterTime = true;
                        $scope.showFilterDate = false;
                        $scope.showFilterText = false;
                        $scope.showFilterDropDown = false;
                    }
                    else if ($scope.filteredData.Definition.Type == 'DropDown') {
                        $scope.showFilterDropDown = true
                        $scope.showFilterDate = false;
                        $scope.showFilterText = false;
                        $scope.showFilterTime = false;
                    }
                    else {
                        $scope.showFilterText = true;
                        $scope.showFilterDropDown = false;
                        $scope.showFilterDate = false;
                        $scope.showFilterTime = false;
                        $scope.filteredStatus = { "Definition": undefined };
                    }
                }
            }, 100);

            //Call actionForm('Load') and processSorting function
            var init = function () {
                if ($scope.datadefinition.CurrentLength == 0)
                    $scope.actionForm('Load');
                else {
                    if ($scope.datadefinition.CurrentLength == 20)
                        $scope.datadefinition.DataList.splice(($scope.datadefinition.DataList.length - 1), 1);
                }
                $scope.processSorting($scope.criteria);
            };

            init();
        }
    }
}