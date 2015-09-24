dentalApp.directive('dirFiltering', function () {
    return {
        restrict: 'E',
        scope: {
            filterdefinition: '=',      /*
                                            Url         - Contains the API Url for Filter
                                            Source      - Contains the data needed for filtering such as Label, Property, Values and Type
                                            DataList    - Contains the data filtered from the server
                                            DataItem1   - Contains the data as parameter in filtering data to the server
                                            DataItem2   - Contains the data as parameter in filtering data to the server
                                            FilteredData- Contains the list of the filtered criteria
                                        */
            filterlistener: '=',        //listens if search button was clicked
            otheractions: '&',          /*
                                            PreFilterData   - Triggers before searching filtered data
                                            LoadData        - Function that will trigger if search button was clicked but filtered data is empty
                                            PostFilterData  - Function that will trigger after searching of filtered data
                                        */
            showformerror: '&'
        },
        templateUrl: '/Directive/Filtering',
        controller: function ($scope, $http, $interval, $filter, $parse, $compile, LxProgressService, LxDialogService) {
            $scope.countFilteredCriteria = 0;
            $scope.search = false;
            $scope.retrieving = false;

            //Set the filter variables default value
            $scope.setFilterVariables = function () {
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

            //triggers the function that will set the filter variables default value
            $scope.setFilterVariables();

            //Function that will call Modal for filtering
            $scope.showModalFilter = function () {
                $scope.otheractions({ action: $scope.filteredData.Definition.Values[0] });
            };

            //Add criteria to filtered list
            $scope.addToFilteredList = function () {
                var index = $scope.filteredData.Definition.Index;

                switch ($scope.filteredData.Definition.Type) {
                    case "Date":
                        if ($scope.filterDate.FromDate <= $scope.filterDate.ToDate) {
                            $scope.filterdefinition.Source[index].From  = $scope.filterDate.FromDate;
                            $scope.filterdefinition.Source[index].To = $scope.filterDate.ToDate;
                            $scope.countFilteredCriteria++;
                        }
                        else
                            $scope.showformerror({ error: "End Date must be beyond the Start Date." });
                        break;
                    case "DropDown":
                        if (angular.isDefined($scope.filteredStatus.Definition)) {
                            $scope.filterdefinition.Source[index].From  = $scope.filteredStatus.Definition.Value;
                            $scope.filterdefinition.Source[index].To = $scope.filteredStatus.Definition.Label;
                            $scope.countFilteredCriteria++;
                        }
                        else
                            $scope.showformerror({ error: ($scope.filteredData.Definition.Label + " is required.") });
                        break;
                    case "Time":
                        if ($scope.filterTime.FromSeconds < $scope.filterTime.ToSeconds) {
                            $scope.filterdefinition.Source[index].From  = $filter('date')(new Date($scope.filterTime.FromSeconds), "HH:mm")
                            $scope.filterdefinition.Source[index].To    = $filter('date')(new Date($scope.filterTime.ToSeconds), "HH:mm")
                            $scope.countFilteredCriteria++;
                        } else
                            $scope.showformerror({ error: "From time must be less than to To time." });
                        break;
                    case "Modal":
                        if ($scope.filteredData.Definition.To != null) {
                            $scope.filterdefinition.Source[index].From = $scope.filterdefinition.Source[index].Values[1];
                            $scope.countFilteredCriteria++;
                        } else
                            $scope.showformerror({ error: ($scope.filteredData.Definition.Label + " is required.") });
                        break;
                    //Default Type
                    default:
                        if ($scope.searchValue != "") {
                            $scope.filterdefinition.Source[index].From = $scope.searchValue;
                            $scope.countFilteredCriteria++;
                        }
                        else
                            $scope.showformerror({ error: ($scope.filteredData.Definition.Label + " is required.") });
                        break;
                }
            };

            //Delete criteria to filtered list
            $scope.deleteFilteredData = function (index) {
                $scope.filterdefinition.Source[index].From = null;
                $scope.filterdefinition.Source[index].To = null;
                $scope.countFilteredCriteria--;
            };

            //Triggers when user click search button
            $scope.submitFilteredData = function ()
            {
                LxProgressService.circular.show('#5fa2db', '#progress');
                $scope.retrieving = true;
                if ($scope.countFilteredCriteria > 0) {
                    //If submitFilteredData function is called via clicking the search button then reset the DataList
                    if($scope.search == true){
                        $scope.search = false;
                        $scope.filterdefinition.DataList = [];
                    }
                    if ($scope.otheractions({ action: 'PreFilterData' })) {
                        $scope.url = $scope.filterdefinition.Url + $scope.filterdefinition.DataList.length;
                        $scope.parameter = [];
                        $scope.parameter.push($scope.filterdefinition.DataItem1);
                        $scope.parameter.push($scope.filterdefinition.DataItem2);

                        //Send http request to server
                        $http.put($scope.url, $scope.parameter)
                        .success(function (data, status) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i] != null)
                                    $scope.filterdefinition.DataList.push(data[i]);
                            }

                            if ($scope.otheractions({ action: 'PostFilterData' }))
                                $scope.retrieving = false;
                            LxProgressService.circular.hide();
                        })
                        .error(function (err, status) {
                            $scope.retrieving = false;
                            $scope.showformerror({ error: err });
                            LxProgressService.circular.hide();
                        })
                    }
                    else {
                        LxProgressService.circular.hide();
                    }
                }
                else {
                    $scope.filterdefinition.DataList = [];
                    $scope.otheractions({ action: 'LoadData' })
                    LxProgressService.circular.hide();
                }
            }

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

            //Listener that will check of user's action
            $interval(function () {
                var width = window.innerWidth;

                //Check if directive request for filtering and status is not retrieving
                if ($scope.filterlistener == true && $scope.retrieving == false) {
                    $scope.filterlistener = false;
                    $scope.submitFilteredData();
                }

                if (width < 1030) {
                    $scope.criteriaStyle = "";
                    $scope.searchValueStyle = "";
                    $scope.searchDateTimeStyle = "";
                    $scope.searchStyle = "";
                    $scope.addCriteriaStyle = "padding-bottom: 10px;";
                    $scope.filterContainerStyle = "";
                }
                else {
                    $scope.criteriaStyle = "width: 250px;";
                    $scope.searchValueStyle = "width: 450px; padding-left:10px;";
                    $scope.searchDateTimeStyle = "width: 225px; padding-left:10px;";
                    $scope.searchStyle = "width:100px;padding-left:10px; padding-top:35px;";
                    $scope.addCriteriaStyle = "width:120px;padding-left:10px; padding-top:35px;";
                    $scope.filterContainerStyle = "padding-left:10px;";
                }

                //Showing and hiding of input type
                if (angular.isDefined($scope.filteredData.Definition)) {
                    if ($scope.filteredData.Definition.Type == 'Date') {
                        $scope.showFilterDate = true;
                        $scope.showFilterText = false;
                        $scope.showFilterDropDown = false
                        $scope.showFilterTime = false;
                        $scope.filteredStatus = { "Definition": undefined };
                        $scope.showFilterModal = false;
                    }
                    else if ($scope.filteredData.Definition.Type == 'Time') {
                        $scope.showFilterTime = true;
                        $scope.showFilterDate = false;
                        $scope.showFilterText = false;
                        $scope.showFilterDropDown = false;
                        $scope.showFilterModal = false;
                    }
                    else if ($scope.filteredData.Definition.Type == 'DropDown') {
                        $scope.showFilterDropDown = true
                        $scope.showFilterDate = false;
                        $scope.showFilterText = false;
                        $scope.showFilterTime = false;
                        $scope.showFilterModal = false;
                    }
                    else if ($scope.filteredData.Definition.Type == 'Modal') {
                        $scope.showFilterModal = true;
                        $scope.showFilterDropDown = false
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
                        $scope.showFilterModal = false;
                    }
                }
            }, 100);
        }
    };
});