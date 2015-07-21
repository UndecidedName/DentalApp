﻿dentalApp.directive('dirDataGrid3', function () {
    /*---------------------------------------------------------------------------------//
     Directive Name: dirDataGrid1
     Description: Functionalities are the same to datagrid1 but no create button in listing
     Author: Kenneth Ybañez
     Note: If this is used more than once in a page, the other instance should be resetted.
     Functionalities:
     1. CRUD
     2. Pagination thru scrolling
     3. Sorting
     5. Overriding and Overloading by using otherActions scope predefined actions
     6. Formatting of Date,Time,DateTime, String, String-Upper, Boolean and Number
     7. Validate required fields
    ---------------------------------------------------------------------------------*/
    return {
        restrict: 'E',
        scope: {
            actioncreate: '=',          //scope that will listen if the create button in main page was clicked
            actionmode: '=',            //scope that will hold the label header of the modal
            datadefinition: '=',        /* Properties:
                                            Header      - Contains the header of the DataGrid
                                            Note: If first value of header key is two words, use underscore instead of space(Ex. Created_Date)
                                            Keys        - Columns/Keys to be showin in DataGrid
                                            Type        - Type of the Columns/Keys(String,Date,DateTime,Time)
                                            DataList    - Contains the List of data to be displayed in DataGrid
                                            CurrentLength - Contains the current length of the data list
                                            APIUrl      - Contains the API Url, first index is for Get then second index is for CUD,
                                                          If Get url parameter is more than one, separate it by using space.
                                                          (Ex. /api/Truck?length=1 &truckerId=1&truckerName=2&......)
                                            DataItem    - Contains the data of the selected item in DataGrid List
                                            ServerData  - contains the data from the server response
                                            DataTarget  - Contains the data target for the context-menu
                                            ViewOnly    - Determine if the fields of the selected item are editable or not
                                            ContextMenu - Actions to be passed in each context menu item
                                            ContextMenuLabel - Lable for each context menu item
                                        */
            submitbuttontext: '=',      //scope that holds the submit button label
            submitbuttonlistener: '=',  //scope that will serve as listener that will identify if the user submit an action  
            closecontainer: '&',        //function that will close the form container
            opencontainer: '&',         //function that will open the form container
            otheractions: '&',          /*
                                            Function that will trigger when other actions is passed 
                                            other than the default actions found under actionForm function.
                                            Note: Return true if purpose is to overload, false if override

                                            PreSubmit           - triggers before submit function
                                            PostSubmit          - triggers after submit function
                                            PreSave             - triggers before calling apiCreate function under submit function
                                            PostSave            - triggers after calling apiCreate function under submit function
                                            PreUpdate           - triggers before calling apiUpdate function under submit function
                                            PostUpdate          - triggers after calling apiUpdate function under submit function
                                            PreDelete           - triggers before calling apiDelete function under submit function
                                            PostDelete          - triggers after calling apiDelete function under submit function
                                            PreView             - triggers before viewing under submit function
                                            PostView            - triggers after viewing under submit function
                                            PreAction           - triggers before executing an action in actionForm function
                                            PostAction          - triggers after executing an action in actionForm function
                                            PreLoadAction       - triggers before calling loadData function under actionForm function
                                            PostLoadAction      - triggers after calling loadData function under actionForm function
                                            PreCreateAction     - triggers before executing Create action under actionForm function
                                            PostCreateAction    - triggers after executing Create action under actionForm function
                                            PreEditAction       - triggers before executing Edit action under actionForm function
                                            PostEditAction      - triggers after executing Edit action under actionForm function
                                            PreDeleteAction     - triggers before executing Delete action under actionForm function
                                            PostDeleteAction    - triggers after executing Delete action under actionForm function
                                            PreViewAction       - triggers before executing Edit action under actionForm function
                                            PostViewAction      - triggers after executing Edit action under actionForm function
                                        */
            resetdata: '&',             //function that will reset the dataitem
            showformerror: '&',         //function that will trigger when an error occured
            contextMenuLabel: '=',
            contextMenuLabelImage: '='
        },
        templateUrl: '/Directive/DataGrid3',
        controller: function ($scope, $http, $interval, $filter, $parse, $compile, LxProgressService) {
            var stop;
            $scope.sortByDesc = true;
            $scope.sortByAsc = false;
            $scope.criteria = $scope.datadefinition.Keys[0];
            $scope.selectedIndex = null;
            $scope.filteredValue = "";

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

            //Export data to Excel or word
            function fnExcelReport(type) {
                var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
                var textRange; var j = 0;
                tab = document.getElementById('export'); // id of table


                for (j = 0 ; j < tab.rows.length ; j++) {
                    tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
                    //tab_text=tab_text+"</tr>";
                }

                tab_text = tab_text + "</table>";
                tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
                tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
                tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

                var ua = window.navigator.userAgent;
                var firefox = navigator.userAgent.search("Firefox");
                var msie = ua.indexOf("MSIE ");

                if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
                {
                    exportTemplate.document.open("txt/html", "replace");
                    exportTemplate.document.write(tab_text);
                    exportTemplate.document.close();
                    exportTemplate.focus();
                    if (type == 'doc')
                        sa = exportTemplate.document.execCommand("SaveAs", true, "Report.doc");
                    else if (type == 'excel')
                        sa = exportTemplate.document.execCommand("SaveAs", true, "Report.xls");
                }
                else                 //other browser not tested on IE 11
                {
                    if (type == 'doc')
                        sa = window.open('data:application/vnd.ms-doc,' + encodeURIComponent(tab_text));
                    else if (type == 'excel')
                        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
                }
                if (firefox > -1 && type == 'png')
                    return $scope.$broadcast('export-png', {});
                else if (firefox <= -1 && type == 'png') {
                    alert('Not supported in this browser.');
                    return;
                }

                return (sa);
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
            $scope.searchData = function (id) {
                var i = 0;
                for (i = 0; i < $scope.datadefinition.DataList.length; i++) {
                    if (id == $scope.datadefinition.DataList[i].Id) {
                        return i;
                    }
                }
                return i;
            };

            //initialize selected index
            $scope.setSelected = function (id) {
                $scope.selectedIndex = $scope.searchData(id);
            };

            //Manage the main action
            $scope.action = function (action) {
                $scope.submitbuttontext = "Submit";
                $scope.datadefinition.ViewOnly = false;
                switch (action) {
                    case 'Create':
                        $scope.resetdata();
                        break;
                    case 'Edit':
                        $scope.datadefinition.DataItem = $scope.datadefinition.DataList[$scope.selectedIndex];
                        break;
                    case 'Delete':
                        $scope.datadefinition.DataItem = $scope.datadefinition.DataList[$scope.selectedIndex];
                        $scope.submitbuttontext = "Delete";
                        $scope.datadefinition.ViewOnly = true;
                        break;
                    case 'View':
                        $scope.datadefinition.DataItem = $scope.datadefinition.DataList[$scope.selectedIndex];
                        $scope.submitbuttontext = "Close";
                        $scope.datadefinition.ViewOnly = true;
                        break;
                }
                $scope.opencontainer();
                return true;
            };

            //Manage user actions
            $scope.actionForm = function (action) {
                //It should be outside of the PreAction statement
                if (action == 'Load') {
                    if ($scope.otheractions({ action: 'PreLoadAction' })) {
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
                    $scope.actionmode = action;
                    switch (action) {
                        case 'Create':
                            if ($scope.otheractions({ action: 'PreCreateAction' })) {
                                if ($scope.action(action))
                                    $scope.otheractions({ action: 'PostCreateAction' })
                            }
                            break;
                        case 'Edit':
                            if ($scope.otheractions({ action: 'PreEditAction' })) {
                                if ($scope.action(action))
                                    $scope.otheractions({ action: 'PostEditAction' })
                            }
                            break;
                        case 'Delete':
                            if ($scope.otheractions({ action: 'PreDeleteAction' })) {
                                if ($scope.action(action))
                                    $scope.otheractions({ action: 'PostDeleteAction' })
                            }
                            break;
                        case 'View':
                            if ($scope.otheractions({ action: 'PreViewAction' })) {
                                $scope.action(action);
                                $scope.otheractions({ action: 'PostViewAction' })
                            }
                            break;
                        case 'Excel':
                            fnExcelReport('excel');
                            break;
                        case 'Doc':
                            fnExcelReport('doc');
                            break;
                        case 'PNG':
                            fnExcelReport('png');
                            //$scope.$broadcast('export-png', {});
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
                LxProgressService.circular.show('#5fa2db', '#progress');
                $http.post($scope.datadefinition.APIUrl[1], $scope.datadefinition.DataItem)
                    .success(function (data, status) {
                        if (data.status == "SUCCESS") {
                            $scope.datadefinition.DataItem.Id = data.objParam1.Id;
                            $scope.datadefinition.DataList.push($scope.datadefinition.DataItem);
                            $scope.datadefinition.ServerData = [];
                            $scope.datadefinition.ServerData.push(data);
                            //$scope.closecontainer();
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

            // Update
            $scope.apiUpdate = function (id) {
                LxProgressService.circular.show('#5fa2db', '#progress');
                $http.put($scope.datadefinition.APIUrl[1] + "/" + id, $scope.datadefinition.DataItem)
                    .success(function (data, status) {
                        if (data.status == "SUCCESS") {
                            //$scope.closecontainer();
                            LxProgressService.circular.hide();
                            $scope.datadefinition.ServerData = [];
                            $scope.datadefinition.ServerData.push(data);
                            $scope.otheractions({ action: 'PostUpdate' });
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
                LxProgressService.circular.show('#5fa2db', '#progress');
                $http.delete($scope.datadefinition.APIUrl[1] + "/" + id)
                    .success(function (data, status) {
                        if (data.status == "SUCCESS") {
                            $scope.datadefinition.DataList.splice($scope.selectedIndex, 1);
                            LxProgressService.circular.hide();
                            $scope.datadefinition.ServerData = [];
                            $scope.datadefinition.ServerData.push(data);
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

            //Search key
            $scope.searchKey = function (key) {
                for (var i = 0; i < $scope.datadefinition.Keys.length; i++) {
                    if (key == $scope.datadefinition.Keys[i])
                        return true;
                }
                return false;
            };

            //Function that check required fields
            $scope.checkRequiredFields = function () {
                var key = "", label = "";
                for (var i = 0; i < $scope.datadefinition.RequiredFields.length; i++) {
                    var split = $scope.datadefinition.RequiredFields[i].split("-");
                    key = split[0];
                    //Check if key is valid
                    if ($scope.searchKey(key) == false) {
                        $scope.showformerror({ error: key + " is undefined." });
                        return false;
                    }
                    else {
                        //Check if label name exist in a key
                        if (split.length == 2)
                            label = split[1];
                        else {
                            $scope.showformerror({ error: "Label name is required for Key: " + key });
                            return false;
                        }

                        if ($scope.datadefinition.DataItem[key] == null || $scope.datadefinition.DataItem[key] == "") {
                            $scope.showformerror({ error: label + " is required." });
                            return false;
                        }
                    }
                }
                return true;
            };

            //Manage the submition of data base on the user action
            $scope.submit = function (action) {
                if ($scope.otheractions({ action: 'PreSubmit' })) {
                    if ($scope.checkRequiredFields()) {
                        switch (action) {
                            case 'Create':
                                if ($scope.otheractions({ action: 'PreSave' }))
                                    $scope.apiCreate();
                                break;
                            case 'Edit':
                                if ($scope.otheractions({ action: 'PreUpdate' }))
                                    $scope.apiUpdate($scope.datadefinition.DataItem.Id)
                                break;
                            case 'Delete':
                                if ($scope.otheractions({ action: 'PreDelete' }))
                                    $scope.apiDelete($scope.datadefinition.DataItem.Id);
                                break;
                            case 'View':
                                if ($scope.otheractions({ action: 'PreView' })) {
                                    $scope.closecontainer();
                                    $scope.otheractions({ action: 'PostView' })
                                }
                                break;
                        }
                    }
                    $scope.otheractions({ action: 'PostSubmit' })
                }
            }

            //Listener that will check if user Submit an action
            $interval(function () {
                if ($scope.submitbuttonlistener == true) {
                    //reset listener to false
                    $scope.submitbuttonlistener = false;
                    $scope.submit($scope.actionmode);
                }
                if ($scope.actioncreate == true) {
                    $scope.actioncreate = false;
                    $scope.actionForm('Create');
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
});
