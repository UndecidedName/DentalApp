dentalApp.controller('ScheduleController', ScheduleController);
function ScheduleController($scope, LxNotificationService, LxDialogService, $interval, $filter, $http, $rootScope, $compile)
{
    $scope.modelName = "Set Schedule";
    $scope.showForm = false;
    $scope.tabPages = ['Date', 'Time'];
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
    $scope.showDialog = function (dialogId) {
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
    $scope.getDentistList = function () {
        $http.get("/api/DentistInformations?length=" + $rootScope.dentistInformation.length)
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
                    "APIUrl": ['/api/DentistInformations?length='],
                    "Dialog": "dentistList"
                };
        });
    };

    $scope.loadMaster = function () {
        //clear other dirDataGrid1 instance
        //$content = angular.element(document.querySelector('#truckList')).html('');
        //$compile($content)($scope);
        $scope.loadMasterDataGrid();
        $scope.initMasterDataGridParameters();
    };
    $scope.loadMasterDataGrid = function () {
        html = '<dir-data-grid1 type = 1 actioncreate="actionMaster"' +
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
                       '/api/ScheduleMasters', //post, put, delete
            ],
            "DataItem": {},
            "DataTarget": "DataTableMenuMaster",
            "ViewOnly": false,
            "ContextMenu": [],
            "ContextMenuImage": []
        };
        //Do Overriding or Overloading in this function
        $scope.otherActionsMaster = function (action) {
            switch (action) {
                case 'PostEditAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    return true;
                case 'PostDeleteAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    return true;
                case 'PostViewAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    return true;
                case 'PreSave':
                    delete $scope.dataDefinitionMaster.DataItem.Id;
                    return true;
                case 'PostSave':
                    return true;
                case 'PreUpdate':
                    $scope.dataModel = angular.copy($scope.dataDefinitionMaster.DataItem);
                    delete $scope.dataDefinitionMaster.DataItem.DentistInformation;
                    return true;
                case 'PostUpdate':
                    return true;
                case 'PostLoadAction':
                    for (var i = $scope.dataDefinitionMaster.CurrentLength; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                        //delete $scope.dataDefinitionMaster.DataList[i].DentistInformation.Appointments;
                        //delete $scope.dataDefinitionMaster.DataList[i].DentistInformation.ScheduleMasters;
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
            //Load dirDataGrid1 of main page
            $scope.loadMaster();
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
    $scope.getDentistList();
    $scope.loadMaster();

    $scope.dataDefinitionDetail = {};
    $scope.dataDefinitionDetail.DataItem = {
        Id: null,
        ScheduleMasterId: null,
        FromTime: $filter('date')(new Date().getTime(), "hh:mm"),
        ToTime: $filter('date')(new Date().getTime(), "hh:mm"),
        DentistName: null
    };
    $scope.closeTime = function (dialogId, col)
    {
        if (col === 'From') {
            var promise = $interval(function () {
                $scope.dataDefinitionDetail.DataItem.FromTime = $filter('date')($scope.dataDefinitionDetail.DataItem.FromTime, "hh:mm");
                $interval.cancel(promise);
                promise = undefined;
                LxDialogService.close(dialogId);
            }, 100);
        }
        else {
            var promise = $interval(function () {
                $scope.dataDefinitionDetail.DataItem.ToTime = $filter('date')($scope.dataDefinitionDetail.DataItem.ToTime, "hh:mm");
                $interval.cancel(promise);
                promise = undefined;
                LxDialogService.close(dialogId);
            }, 100);
        }
    }
}