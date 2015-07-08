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
            otheractions: '&',
            closecontainer: '&'
        },
        templateUrl: 'Directive/DataModal1',
        controller: function ($scope, $http, $interval, $filter, $parse, $compile, LxProgressService) {
            var stop;
            $scope.sortByDesc = true;
            $scope.sortByAsc = false;
            $scope.criteria = $scope.datadefinition.Keys[0];
            $scope.selectedIndex = null;
            $scope.filteredValue = "";
            $scope.showClose = false;
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
                    $scope.filteredValue = "None";
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
                        case 'Gender':
                            if(value == "F")
                                $scope.filteredValue = "Female";
                            else
                                $scope.filteredValue = "Male";
                            break;
                        case 'Boolean':
                            if (value)
                                $scope.filteredValue = "Yes";
                            else
                                $scope.filteredValue = "No";
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
                    if ($scope.otheractions({ action: 'PreLoadAction' }))
                        $scope.loadData($scope.datadefinition.DataList.length)
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