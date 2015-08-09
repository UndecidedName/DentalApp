dentalApp.directive('dirDataGrid2', function () {
    /*---------------------------------------------------------------------------------//
     Directive Name: dirDataGrid2
     Description: used only if dataGrid functionality will only delete/cancel record
     Author: Kenneth Ybañez
     Note: If this is used more than once in a page, the other instance should be resetted.
     Functionalities:
     1. Listing
     2. Sorting
     3. Overriding and Overloading by using otherActions scope predefined actions
     4. Formatting of Date,Time,DateTime, String, String-Upper, Boolean and Number
     5. Delete Only
    ---------------------------------------------------------------------------------*/
    return {
        restrict: 'E',
        scope: {
            actioncreate: '=',
            datadefinition: '=',        /* Properties:
                                    Header      - Header of the data grid
                                    Key         - Keys of the data grid  
                                    DataList      - Source of data grid
                                    Type        - Type of the Columns/Keys(String,Date,DateTime,Time)
                                    CurrentLength - Contains the current length of the data list
                                    APIUrl      - Contains the API Url for data retrieval
                                    ServerData  - contains the data from the server response
                                        */
            otheractions: '&',          /*
                                            Function that will trigger when other actions is passed 
                                            other than the default actions found under actionForm function.
                                            Note: Return true if purpose is to overload, false if override

                                            PreSubmit           - triggers before submit function
                                            PostSubmit          - triggers after submit function
                                            PreSave             - triggers before calling apiCreate function under submit function
                                            PostSave            - triggers after calling apiCreate function under submit function
                                            PreDelete           - triggers before calling apiDelete function under submit function
                                            PostDelete          - triggers after calling apiDelete function under submit function
                                            PreAction           - triggers before executing an action in actionForm function
                                            PostAction          - triggers after executing an action in actionForm function
                                            PreLoadAction       - triggers before calling loadData function under actionForm function
                                            PostLoadAction      - triggers after calling loadData function under actionForm function
                                            PreDeleteAction     - triggers before executing Delete action under actionForm function
                                            PostDeleteAction    - triggers after executing Delete action under actionForm function
                                        */
            submitbuttonlistener: '=',  //scope that will serve as listener that will identify if the user submit an action  
            showformerror: '&'
        },
        templateUrl: '/Directive/DataGrid2',
        controller: function ($scope, $http, $interval, $filter, $parse, $compile, LxProgressService) {
            var stop;
            $scope.criteria = $scope.datadefinition.Keys[0];
            $scope.filteredValue = "";
            $scope.selectedIndex = null;
            $scope.contextMenuLabelDefault = ['Delete'];
            $scope.contextMenuLabelImage = ['mdi mdi-delete'];

            if ($scope.datadefinition.Type[0] == 'DateTime' || $scope.datadefinition.Type[0] == 'Date' || $scope.datadefinition.Type[0] == 'Time' || $scope.datadefinition.Type[0] == 'Formatted-Time') {
                $scope.sortByDesc = false;
                $scope.sortByAsc = true;
            }
            else {
                $scope.sortByDesc = true;
                $scope.sortByAsc = false;
            }

            //Set the focus on top of the page during load
            $scope.focusOnTop = function () {
                $(document).ready(function () {
                    $(this).scrollTop(0);
                });
            };

            $interval(function () {
                var width = window.innerWidth;
                if (width < 650) {
                    $scope.menuPosition = "left";
                }
                else {
                    $scope.menuPosition = "right";
                }
            }, 100);

            $scope.getData = function () {
                if ($scope.datadefinition.CurrentLength != $scope.datadefinition.DataList.length) {
                    $scope.actionForm('Load');
                    $scope.datadefinition.CurrentLength = $scope.datadefinition.DataList.length;
                }
            }

            //Function that format a string value to properCase(Ex. Fast Cargo)
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

            //Load data
            $scope.loadData = function (length) {
                LxProgressService.circular.show('#5fa2db', '#progressDataGrid2');
                var url = "";
                var apiUrlSplit = $scope.datadefinition.APIUrl[0].split(" ");
                url = apiUrlSplit[0] + length;
                for (var i = 1; i < apiUrlSplit.length; i++) {
                    url = url + apiUrlSplit[i];
                }
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

            //Manage the main action
            $scope.action = function (action) {
                switch (action) {
                    case 'Delete':
                        $scope.datadefinition.DataItem = {};
                        $scope.datadefinition.DataItem = $scope.datadefinition.DataList[$scope.selectedIndex];
                        $scope.submit(action);
                        break;
                }
                return true;
            };

            //Manage user actions
            $scope.actionForm = function (action) {
                //It should be outside of the PreAction statement
                if (action == 'Load') {
                    if ($scope.otheractions({ action: 'PreLoadAction' }))
                    {
                        if ($scope.datadefinition.CurrentLength == 0)
                            $scope.loadData($scope.datadefinition.DataList.length);
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
                            $scope.processSorting($scope.criteria);
                            $scope.otheractions({ action: 'PostLoadAction' });
                            $scope.otheractions({ action: 'PostAction' });
                        }
                    }, 100);
                }
                if (action == 'Refresh') {
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
                if ($scope.otheractions({ action: 'PreAction' })) {
                    switch (action) {
                        case 'Delete':
                            if ($scope.otheractions({ action: 'PreDeleteAction' })) {
                                if ($scope.action(action))
                                    $scope.otheractions({ action: 'PostDeleteAction' })
                            }
                            break;
                        default:
                            $scope.otheractions({ action: action });
                            break;
                    }
                    $scope.otheractions({ action: 'PostAction' });
                }
            };

            //Save data
            $scope.apiCreate = function () {
                LxProgressService.circular.show('#5fa2db', '#progressDataGrid2');
                $http.post($scope.datadefinition.APIUrl[1], $scope.datadefinition.DataItem)
                    .success(function (data, status) {
                        $scope.datadefinition.ServerData = [];
                        $scope.datadefinition.ServerData.push(data);
                        if (data.status == "SUCCESS") {
                            $scope.datadefinition.DataItem.Id = data.objParam1.Id;
                            $scope.datadefinition.DataList.push($scope.datadefinition.DataItem);
                            LxProgressService.circular.hide();
                            $scope.otheractions({ action: 'PostSave' });
                            return true;
                        }
                        else {
                            $scope.showformerror({ error: data.message });
                            LxProgressService.circular.hide();
                        }
                    })
                    .error(function (data, status) {
                        $scope.showformerror({ error: status });
                        LxProgressService.circular.hide();
                    })
                return false;
            };

            // Delete
            $scope.apiDelete = function (id) {
                LxProgressService.circular.show('#5fa2db', '#progressDataGrid2');
                $http.delete($scope.datadefinition.APIUrl[1] + "/" + id)
                    .success(function (data, status) {
                        $scope.datadefinition.ServerData = [];
                        $scope.datadefinition.ServerData.push(data);
                        if (data.status == "SUCCESS") {
                            $scope.datadefinition.DataList.splice($scope.selectedIndex, 1);
                            LxProgressService.circular.hide();
                            $scope.otheractions({ action: 'PostDelete' });
                            return true;
                        }
                        else {
                            $scope.showformerror({ error: data.message });
                            LxProgressService.circular.hide();
                        }
                    })
                    .error(function (data, status) {
                        $scope.showformerror({ error: status });
                        LxProgressService.circular.hide();
                    })
                return false;
            };

            //initialize selected index
            $scope.setSelected = function (id) {
                $scope.selectedIndex = $scope.searchData(id);
            };

            //search data
            $scope.searchData = function (id) {
                var i = 0;
                for (i = 0; i < $scope.datadefinition.DataList.length; i++) {
                    if (id == $scope.datadefinition.DataList[i].Id) {
                        return i;
                    }
                }
                return i;
            };

            //Search key
            $scope.searchKey = function (key) {
                for (var i = 0; i < $scope.datadefinition.Keys.length; i++) {
                    if (key == $scope.datadefinition.Keys[i])
                        return true;
                }
                return false;
            };

            //Manage the submition of data base on the user action
            $scope.submit = function (action) {
                if ($scope.otheractions({ action: 'PreSubmit' })) {
                        switch (action) {
                            case 'Create':
                                if ($scope.otheractions({ action: 'PreSave' }))
                                    $scope.apiCreate();
                                break;
                            case 'Delete':
                                if ($scope.otheractions({ action: 'PreDelete' }))
                                    $scope.apiDelete($scope.datadefinition.DataItem.Id);
                                break;
                        }
                    $scope.otheractions({ action: 'PostSubmit' })
                }
            }

            //Listener that will check if user Submit an action
            $interval(function () {
                if ($scope.submitbuttonlistener == true) {
                    //reset listener to false
                    $scope.submitbuttonlistener = false;
                    $scope.submit('Create');
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
                $scope.focusOnTop();
            };

            init();
        }
    }
});
