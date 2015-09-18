dentalApp.controller('ScheduleController', ScheduleController);
function ScheduleController($scope, LxNotificationService, LxDialogService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Set Schedule";
    $scope.showForm = false;
    $scope.tabPages = ['Date'];
    $scope.selectedTab = 0;
    
    $scope.dentistInformation = [];

    $scope.setSelectedTabStyle = function () {
        var promise = $interval(function () {
            var element = document.getElementById($scope.tabPages[0]);
            if (element != null) {
                element.style.color = "#4FC1E9";
                $interval.cancel(promise);
                promise = undefined;
            }
        }, 100);
    };

    $scope.setSelectedTab = function (index) {
        $scope.selectedTab = index;
        for (var i = 0; i < $scope.tabPages.length; i++) {
            if (i == $scope.selectedTab) {
                var element = document.getElementById($scope.tabPages[i]);
                element.style.color = "#4FC1E9";
            }
            else {
                var element = document.getElementById($scope.tabPages[i]);
                element.style.color = "";
            }
        }
    };

    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    };

    //Listen the changes of the scope
    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $rootScope.browserWidth = false;
            $scope.setStyle = "";
        }
        else {
            $rootScope.browserWidth = true;
            $scope.setStyle = "width:465px; max-width:100%";
        }
    }, 100);
    
    $scope.showDialog = function (dialogId, type) {
        if(type == 'From')
            $scope.dataDefinitionDetail.DataItem.FromTime = $scope.FromTimeHolder;
        else if (type == 'To')
            $scope.dataDefinitionDetail.DataItem.ToTime = $scope.ToTimeHolder;
        LxDialogService.open(dialogId);
    };
    $scope.closeDate = function (dialogId) {
        var promise = $interval(function () {
            $scope.dataDefinitionMaster.DataItem.Date = "";
            $scope.dataDefinitionMaster.DataItem.DateHolder = $filter('date')($scope.dataDefinitionMaster.DataItem.DateHolder, "MM/dd/yyyy");
            $scope.dataDefinitionMaster.DataItem.Date = $scope.dataDefinitionMaster.DataItem.DateHolder;
            $interval.cancel(promise);
            promise = undefined;
            LxDialogService.close(dialogId);
        }, 100);
    };
    $scope.closeDentistModal = function (dialogId) {
        if (angular.isDefined($scope.dataDefinitionDentisList.DataItem.Id)) {
            $scope.dataDefinitionMaster.DataItem.DentistId = $scope.dataDefinitionDentisList.DataItem.Id;
            $scope.dataDefinitionMaster.DataItem.DentistName = $scope.dataDefinitionDentisList.DataItem.FirstName + " "
                                                                + $scope.dataDefinitionDentisList.DataItem.MiddleName + " "
                                                                + $scope.dataDefinitionDentisList.DataItem.LastName;
        }
        LxDialogService.close(dialogId);
        document.getElementsByClassName("dialog-filter dialog-filter--is-shown").remove();
    };
    $scope.closeTime = function (dialogId, col) {
        if (col === 'From') {
            var promise = $interval(function () {
                $scope.fromSeconds = new Date($scope.dataDefinitionDetail.DataItem.FromTime).getTime();
                $scope.FromTimeHolder = $scope.dataDefinitionDetail.DataItem.FromTime;
                $scope.dataDefinitionDetail.DataItem.FromTime = $filter('date')(new Date($scope.dataDefinitionDetail.DataItem.FromTime), "hh:mm a");
                $interval.cancel(promise);
                promise = undefined;
                LxDialogService.close(dialogId);
            }, 100);
        }
        else {
            var promise = $interval(function () {
                $scope.toSeconds = new Date($scope.dataDefinitionDetail.DataItem.ToTime).getTime();
                $scope.ToTimeHolder = $scope.dataDefinitionDetail.DataItem.ToTime;
                $scope.dataDefinitionDetail.DataItem.ToTime = $filter('date')(new Date($scope.dataDefinitionDetail.DataItem.ToTime), "hh:mm a");
                $interval.cancel(promise);
                promise = undefined;
                LxDialogService.close(dialogId);
            }, 100);
        }
    };
    $scope.getDentistList = function () {
        $http.get("/api/UserInformations?length=" + $scope.dentistInformation.length + "&userType=4&status=1")
        .success(function (data, status) {
            for (var j = 0; j < data.length; j++)
                $scope.dentistInformation.push(data[j]);
            $scope.dataDefinitionDentisList = {
                "Header": ['First Name', 'Middle Name', 'Last Name', 'Gender', 'Contact No.', 'No'],
                "Keys": ['FirstName', 'MiddleName', 'LastName', 'Gender', 'ContactNo'],
                "Type": ['String', 'String', 'String', 'Gender', 'Number'],
                "DataList": $scope.dentistInformation,
                "CurrentLength": $scope.dentistInformation.length,
                "DataItem": {},
                "APIUrl": ['/api/UserInformations?length= &userType=4&status=1'],
                "Dialog": "dentistList"
            };
            $scope.filterDefinitionDentist = {
                "Url": '/api/UserInformations?length= &userType=4&status=1',//get
                "Source": [
                            { "Label": "First Name", "Property": "FirstName", "Values": [], "Type": "Default" },
                            { "Label": "Middle Name", "Property": "MiddleName", "Values": [], "Type": "Default" },
                            { "Label": "Last Name", "Property": "LastName", "Values": [], "Type": "Default" },
                            {
                                "Label": "Gender", "Property": "Gender", "Values": [
                                                                                      { "Label": "Female", "Value": "F" },
                                                                                      { "Label": "Male", "Value": "M" }
                                ], "Type": "DropDown"
                            },
                            { "Label": "Contact No", "Property": "ContactNo", "Values": [], "Type": "Default" },
                ]
            };

            $scope.otherActionDentist= function (action) {
                switch (action) {
                    default: return true;
                }
            };
        });
    };

    $scope.loadMaster = function () {
        $scope.scheduleMaster = [];
        $scope.loadMasterDataGrid();
        $scope.initMasterDataGridParameters();
    };
    $scope.loadMasterDataGrid = function () {
        html = '<dir-data-grid1 actioncreate="actionMaster"' +
                         'actionmode="actionModeMaster"' +
                         'contextmenuitem="contextMenuItemMaster"' +
                         'datadefinition="dataDefinitionMaster"' +
                         'filterdefinition="filterDefinition"' +
                         'submitbuttontext="submitButtonText"' +
                         'submitbuttonlistener="submitButtonListenerMaster"' +
                         'closecontainer="closeForm()"' +
                         'opencontainer="showMainForm()"' +
                         'otheractions="otherActionsMaster(action)"' +
                         'resetdata="resetMasterItem()"' +
                         'showformerror="showFormErrorMaster(error)">' +
                         '</dir-data-grid1>';
        $content = angular.element(document.querySelector('#masterList')).html(html);
        $compile($content)($scope);
    };
    $scope.initMasterDataGridParameters = function () {
        $scope.submitButtonText = "";
        $scope.submitButtonListenerMaster = false;
        $scope.errorMessageMaster = "";
        $scope.actionCreateMaster = false;
        $scope.actionModeMaster = "Create";//default to Create
        $scope.dataDefinitionMaster = {
            "Header": ['Date', 'Dentist', 'Status', 'No'],
            "Keys": ['Date', 'DentistName', 'Status'],
            "RequiredFields": ['DentistName-Dentist Name'],
            "Type": ['Date', 'String', 'Status-Default'],
            "DataList": $scope.scheduleMaster,
            "CurrentLength": $scope.scheduleMaster.length,
            "APIUrl": ['/api/ScheduleMasters?length=',//get
                       '/api/ScheduleMasters' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenu": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabel": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabelImage": ['mdi mdi-plus', 'mdi mdi-table-edit', 'mdi mdi-delete', 'mdi mdi-eye']
        };

        $scope.filterDefinition = {
            "Url": '/api/ScheduleMasters?length= ',//get
            "Source": [
                        { "Label": "Date", "Property": "Date", "Values": [], "Type": "Date" },
                        { "Label": "Dentist First Name", "Property": "DentistFirstName", "Values": [], "Type": "Default" },
                        { "Label": "Dentist Middle Name", "Property": "DentistMiddleName", "Values": [], "Type": "Default" },
                        { "Label": "Dentist Last Name", "Property": "DentistLastName", "Values": [], "Type": "Default" },
                        {
                            "Label": "Status", "Property": "Status", "Values": [
                                                                                  { "Label": "Open", "Value": "0" },
                                                                                  { "Label": "Closed", "Value": "1" }
                            ], "Type": "DropDown"
                        }
            ]
        };

        //Do Overriding or Overloading in this function
        $scope.otherActionsMaster = function (action) {
            switch (action) {
                case 'PreCreateAction':
                    $scope.tabPages = ['Date'];
                    $scope.selectedTab = 0;
                    return true;
                case 'PostCreateAction':
                    $scope.initializeStatusHolder();
                    return true;
                case 'PostEditAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
                    $scope.initializeStatusHolder();
                    $scope.loadDetail();
                    return true;
                case 'PostViewAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
                    $scope.initializeStatusHolder();
                    $scope.loadDetail();
                    $scope.dataDefinitionDetail.ViewOnly = true;
                    return true;
                case 'PostDeleteAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
                    $scope.initializeStatusHolder();
                    $scope.loadDetail();
                    $scope.dataDefinitionDetail.ViewOnly = true;
                    return true;
                case 'PreSave':
                    delete $scope.dataDefinitionMaster.DataItem.Id;
                    return true;
                case 'PostSave':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
                    $scope.loadDetail();
                    $scope.selectedTab = 1;
                    return true;
                case 'PreUpdate':
                    delete $scope.dataDefinitionMaster.DataItem.DentistInformation;
                    return true;
                case 'PostUpdate':
                    $scope.closeForm();
                    return true;
                case 'PostDelete':
                    $scope.closeForm();
                    return true;
                case 'PostLoadAction':
                    var promise = $interval(function () {
                        if ($scope.dentistInformation.length > 0) {
                            for (var i = $scope.dataDefinitionMaster.CurrentLength; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                                for (var j = 0; j < $scope.dentistInformation.length; j++) {
                                    if ($scope.dataDefinitionMaster.DataList[i].DentistId === $scope.dentistInformation[j].Id)
                                        $scope.dataDefinitionMaster.DataList[i].DentistName = $scope.dentistInformation[j].FirstName + " "
                                                                                            + $scope.dentistInformation[j].MiddleName + " "
                                                                                            + $scope.dentistInformation[j].LastName;
                                }
                            }
                            $interval.cancel(promise);
                            promise = undefined;
                        }
                    }, 100);
                    return true;
                default:
                    return true;
            }
        };
        $scope.resetMasterItem = function () {
            $scope.dataDefinitionMaster.DataItem = {
                Id: null,
                Date: $filter('date')(new Date() - 1, "MM/dd/yyyy"),
                DateHolder: $filter('date')(new Date() - 1, "MM/dd/yyyy"),
                DentistId: null,
                DentistName: null,
                Status: 0,
                StatusHolder:0
            }
        };
        $scope.showFormErrorMaster = function (message) {
            LxNotificationService.error(message);
        };
        //Close Forms and show main form
        $scope.closeForm = function () {
            $scope.showForm = false;
            var element = document.getElementById("grid2");
            if (element != null) {
                element.parentNode.removeChild(element);
                $scope.ScheduleDetail = [];
            }
        };
        //Show main form
        $scope.showMainForm = function () {
            $scope.showForm = true;
        };
        //Submit Master
        $scope.submit = function () {
            $scope.submitButtonListenerMaster = true;
        };
        //Shows Create Form
        $scope.actionForm = function (action) {
            $scope.actionCreateMaster = true;
            $scope.showForm = true;
        };
        $scope.initializeStatusHolder = function () {
            switch ($scope.dataDefinitionMaster.DataItem.Status) {
                case 0:
                    $scope.dataDefinitionMaster.DataItem.StatusHolder = "Open";
                    break;
                default: $scope.dataDefinitionMaster.DataItem.StatusHolder = "Closed";
                    break;
            }
        };
    };

    $scope.loadDetail = function () {
        $scope.scheduleDetail = [];
        $scope.loadDetailDataGrid();
        $scope.initDetailDataGridParameters();
    };
    $scope.loadDetailDataGrid = function () {
        html = '<dir-data-grid2 id="grid2" actioncreate="actionCreateDetail"' +
                         'datadefinition="dataDefinitionDetail"' +
                         'otheractions="otherActionsDetail(action)"' +
                         'submitbuttonlistener="submitButtonListenerDetail"' +
                         'showformerror="showFormErrorDetail(error)">' +
                         '</dir-data-grid2>';
        $content = angular.element(document.querySelector('#detailList')).html(html);
        $compile($content)($scope);
    };
    $scope.initDetailDataGridParameters = function () {
        $scope.actionCreateDetail = false;
        $scope.dataDefinitionDetail = {
            "Header": ['Start Time', 'End Time', 'Status', 'No'],
            "Keys": ['FromTime', 'ToTime', 'Status'],
            "Type": ['Formatted-Time', 'Formatted-Time', 'Status-Default'],
            "DataList": $scope.scheduleDetail,
            "DataItem": {},
            "ViewOnly": false,
            "CurrentLength": $scope.scheduleDetail.length,
            "APIUrl":['/api/ScheduleDetails?length= &masterId=' + $scope.dataDefinitionMaster.DataItem.Id,//get
                       '/api/ScheduleDetails' //post, put, delete
            ],
            "ServerData": []
        };
        //Do Overriding or Overloading in this function
        $scope.otherActionsDetail = function (action) {
            switch (action) {
                case 'PreAction':
                    if ($scope.dataDefinitionMaster.ViewOnly == true)
                        return false;
                    else
                        return true;
                case 'PreLoadAction':
                    if (angular.isDefined($scope.dataDefinitionMaster.DataItem.Id))
                        return true;
                    else
                        return false;
                case 'PreSave':
                    return $scope.validateTime();
                case 'PostSave':
                    $scope.resetDetailItem();
                    $scope.initializeDataGridMasterStatus();
                    return true;
                case 'PostDelete':
                    $scope.resetDetailItem();
                    $scope.initializeDataGridMasterStatus();
                    return true;
                case 'PostSubmit':
                    return true;
                default: return true;
            }
        };
        $scope.resetDetailItem = function () {
            $scope.dataDefinitionDetail.DataItem = {
                Id: null,
                ScheduleMasterId: null,
                FromTime: $filter('date')((new Date() - 1), "hh:mm a"),
                ToTime: $filter('date')((new Date() - 1), "hh:mm a"),
                Status: 0
            }
            $scope.fromSeconds = new Date((new Date() - 1)).getTime();
            $scope.toSeconds = new Date((new Date() - 1)).getTime();
        };
        $scope.showFormErrorDetail = function (message) {
            $scope.resetDetailItem();
            LxNotificationService.error(message);
            $scope.dataDefinitionDetail.DataItem.FromTime = $filter('date')(new Date($scope.fromSeconds), "hh:mm a");
            $scope.dataDefinitionDetail.DataItem.ToTime = $filter('date')(new Date($scope.toSeconds), "hh:mm a");
        };
        $scope.submitDetail = function () {
            $scope.submitButtonListenerDetail = true;
        };
        $scope.initializeDataGridMasterStatus = function () {
            for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                if ($scope.dataDefinitionMaster.DataItem.Id == $scope.dataDefinitionMaster.DataList[i].Id) {
                    $scope.dataDefinitionMaster.DataList[i].Status = $scope.dataDefinitionDetail.ServerData[0].intParam1;
                    $scope.dataDefinitionMaster.DataItem.Status = $scope.dataDefinitionMaster.DataList[i].Status;
                    $scope.initializeStatusHolder();
                    i = $scope.dataDefinitionMaster.DataList.length;
                }
            }
        }
        $scope.validateTime = function () {
            if ($scope.fromSeconds < $scope.toSeconds) {
                $scope.dataDefinitionDetail.DataItem.FromTime = $filter('date')(new Date($scope.fromSeconds), "HH:mm")
                $scope.dataDefinitionDetail.DataItem.ToTime = $filter('date')(new Date($scope.toSeconds), "HH:mm")
                $scope.dataDefinitionDetail.DataItem.ScheduleMasterId = $scope.dataDefinitionMaster.DataItem.Id;
                delete $scope.dataDefinitionDetail.DataItem.Id;
                $scope.dataDefinitionDetail.DataItem.Status = 0;
                return true;
            } else {
                LxNotificationService.error("Start time must be less than the end time.");
                return false;
            }
        };
    };

    $rootScope.manipulateDOM();
    $scope.getDentistList();
    $scope.loadMaster();
    $scope.setSelectedTabStyle();
}