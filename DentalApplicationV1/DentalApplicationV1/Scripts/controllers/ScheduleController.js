dentalApp.controller('ScheduleController', ScheduleController);
function ScheduleController($scope, LxNotificationService, LxDialogService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Set Schedule";
    $scope.showForm = false;
    $scope.tabPages = ['Date'];
    $scope.selectedTab = 0;
    $scope.setSelectedTab = function (index) {
        $scope.selectedTab = index;
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
            $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
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
        $http.get("/api/UserInformations?length=" + $rootScope.dentistInformation.length + "&userType=4")
        .success(function (data, status) {
            for (var j = 0; j < data.length; j++)
                $rootScope.dentistInformation.push(data[j]);
            $scope.dataDefinitionDentisList = {
                "Header": ['First Name', 'Middle Name', 'Last Name', 'Gender', 'Contact No.', 'No'],
                "Keys": ['FirstName', 'MiddleName', 'LastName', 'Gender', 'ContactNo'],
                "Type": ['String', 'String', 'String', 'Gender', 'Number'],
                "DataList": $rootScope.dentistInformation,
                "CurrentLength": $rootScope.dentistInformation.length,
                "DataItem": {},
                "APIUrl": ['/api/UserInformations?length= &userType=4'],
                "Dialog": "dentistList"
            };
        });
    };

    $scope.loadMaster = function () {
        $scope.loadMasterDataGrid();
        $scope.initMasterDataGridParameters();
    };
    $scope.loadMasterDataGrid = function () {
        html = '<dir-data-grid1 actioncreate="actionMaster"' +
                         'actionmode="actionModeMaster"' +
                         'contextmenuitem="contextMenuItemMaster"' +
                         'datadefinition="dataDefinitionMaster"' +
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
            "Header": ['Date', 'Dentist', 'No'],
            "Keys": ['Date', 'DentistName'],
            "RequiredFields": ['DentistName-Dentist Name'],
            "Type": ['Date', 'String'],
            "DataList": $rootScope.scheduleMaster,
            "CurrentLength": $rootScope.scheduleMaster.length,
            "APIUrl": ['/api/ScheduleMasters?length=',//get
                       '/api/ScheduleMasters' //post, put, delete
            ],
            "DataItem": {},
            "ViewOnly": false,
            "ContextMenu": [],
            "ContextMenuImage": []
        };
        //Do Overriding or Overloading in this function
        $scope.otherActionsMaster = function (action) {
            switch (action) {
                case 'PreCreateAction':
                    $scope.tabPages = ['Date'];
                    $scope.selectedTab = 0;
                    return true;
                case 'PostEditAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
                    $scope.loadDetail();
                    return true;
                case 'PostViewAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
                    $scope.loadDetail();
                    $scope.dataDefinitionDetail.ViewOnly = true;
                    return true;
                case 'PostDeleteAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
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
                    for (var i = $scope.dataDefinitionMaster.CurrentLength; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                        for (var j = 0; j < $rootScope.dentistInformation.length; j++) {
                            if ($scope.dataDefinitionMaster.DataList[i].DentistId === $rootScope.dentistInformation[j].Id)
                                $scope.dataDefinitionMaster.DataList[i].DentistName = $rootScope.dentistInformation[j].FirstName + " "
                                                                                    + $rootScope.dentistInformation[j].MiddleName + " "
                                                                                    + $rootScope.dentistInformation[j].LastName;
                        }
                    }
                    return true;
                default:
                    return true;
            }
        };
        $scope.resetMasterItem = function () {
            $scope.dataDefinitionMaster.DataItem = {
                Id: null,
                Date: $filter('date')(new Date() - 1, "MM/dd/yyyy"),
                DentistId: null,
                DentistName: null
            }
        };
        $scope.showFormErrorMaster = function (message) {
            LxNotificationService.error(message);
        };
        //Close Forms and show main form
        $scope.closeForm = function () {
            $scope.showForm = false;
            var element = document.getElementById("grid2");
            element.parentNode.removeChild(element);
            $rootScope.scheduleDetail = [];
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
    };

    $scope.loadDetail = function () {
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
            "Header": ['Start Time', 'End Time', 'No'],
            "Keys": ['FromTime', 'ToTime'],
            "Type": ['Formatted-Time', 'Formatted-Time'],
            "DataList": $rootScope.scheduleDetail,
            "DataItem": {},
            "ViewOnly": false,
            "CurrentLength": $rootScope.scheduleDetail.length,
            "APIUrl":['/api/ScheduleDetails?length= &masterId=' + $scope.dataDefinitionMaster.DataItem.Id,//get
                       '/api/ScheduleDetails' //post, put, delete
                    ]
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
                    return $scope.validateInput();
                case 'PostSave':
                    $scope.resetDetailItem();
                    return true;
                case 'PostDelete':
                    $scope.resetDetailItem();
                default: return true;
            }
        };
        $scope.resetDetailItem = function () {
            $scope.dataDefinitionDetail.DataItem = {
                Id: null,
                ScheduleMasterId: null,
                FromTime: $filter('date')((new Date() - 1), "hh:mm a"),
                ToTime: $filter('date')((new Date() - 1), "hh:mm a")
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
        //Submit Detail
        $scope.submitDetail = function () {
            $scope.submitButtonListenerDetail = true;
        };

        $scope.validateInput = function () {
            if ($scope.fromSeconds < $scope.toSeconds) {
                $scope.dataDefinitionDetail.DataItem.FromTime = $filter('date')(new Date($scope.fromSeconds), "HH:mm")
                $scope.dataDefinitionDetail.DataItem.ToTime = $filter('date')(new Date($scope.toSeconds), "HH:mm")
                $scope.dataDefinitionDetail.DataItem.ScheduleMasterId = $scope.dataDefinitionMaster.DataItem.Id;
                delete $scope.dataDefinitionDetail.DataItem.Id;
                return true;
            } else {
                LxNotificationService.error("Start time must be less than the end time.");
                return false;
            }
        };
    };

    $scope.getDentistList();
    $scope.loadMaster();
}