dentalApp.controller('AppointmentController', AppointmentController);
function AppointmentController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Set Appointment";
    $scope.showForm = false;
    $scope.appointment = [];

    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    };

    $scope.showDialog = function (dialogId) {
        if ($scope.dataDefinitionMaster.ViewOnly == false) {
            $scope.dataDefinitionScheduleDateList.DataItem = {};
            $scope.dataDefinitionMaster.ViewOnly = true;
            LxDialogService.open(dialogId);
        }
    };

    //Retrieve open schedule Master, include dentistinformation
    $scope.getScheduleDateList = function () {
        $scope.scheduleMaster = [];
        $scope.dataDefinitionScheduleDateList = {
            "Header": ['Date', 'Dentist Name', 'No'],
            "Keys": ['Date', 'DentistName'],
            "Type": ['String', 'String'],
            "DataList": $scope.scheduleMaster,
            "CurrentLength": $scope.scheduleMaster.length,
            "DataItem": {},
            "APIUrl": ['/api/ScheduleMasters?length= &status=0'],
            "Dialog": "ScheduleDate"
        };
        $scope.otherActionScheduleDate = function (action) {
            switch (action) {
                case 'PostLoadAction':
                    for (var i = 0; i < $scope.scheduleMaster.length; i++)
                    {
                        $scope.scheduleMaster[i].Date = $filter('date')($scope.scheduleMaster[i].Date, "MM/dd/yyyy");
                        $scope.scheduleMaster[i].DentistName =  $scope.scheduleMaster[i].UserInformation.FirstName + " "
                                                                + $scope.scheduleMaster[i].UserInformation.MiddleName + " "
                                                                + $scope.scheduleMaster[i].UserInformation.LastName;
                    }
                    return true;
                default: return true;
            }
        };

        $scope.closeScheduleDate = function (dialogId) {
            LxDialogService.close(dialogId);
            if ($scope.dataDefinitionScheduleDateList.DataItem.Id != null) {
                LxProgressService.circular.show('#5fa2db', '#progress');
                var promise = $interval(function () {
                    $scope.getScheduleTimeList();
                    LxDialogService.open('ScheduleTime');
                    $interval.cancel(promise);
                    promise = undefined;
                    LxProgressService.circular.hide();
                }, 600);
            }
            else
                $scope.dataDefinitionMaster.ViewOnly = false;
        }
    };

    //Retrieve open schedule Detail
    $scope.getScheduleTimeList = function () {
        $scope.scheduleDetail = [];
        $scope.dataDefinitionScheduleTimeList = {
            "Header": ['Start Time', 'End Time', 'No'],
            "Keys": ['FromTime', 'ToTime'],
            "Type": ['Formatted-Time', 'Formatted-Time'],
            "DataList": $scope.scheduleDetail,
            "CurrentLength": $scope.scheduleDetail.length,
            "DataItem": {},
            "APIUrl": ['/api/ScheduleDetails?length= &masterId=' + $scope.dataDefinitionScheduleDateList.DataItem.Id + '&status=0'],
            "Dialog": "ScheduleTime"
        };

        $scope.otherActionScheduleTime = function (action) {
            switch (action) {
                default: return true;
            }
        };

        $scope.closeScheduleTime = function (dialogId) {
            LxDialogService.close(dialogId);
            $scope.dataDefinitionMaster.ViewOnly = false;
            //Initialize $scope.dataDefinitionMaster.DataItem
            if ($scope.dataDefinitionScheduleTimeList.DataItem.Id != null) {
                $scope.dataDefinitionMaster.DataItem.ScheduleMasterId = $scope.dataDefinitionScheduleDateList.DataItem.Id;
                $scope.dataDefinitionMaster.DataItem.ScheduleDetailId = $scope.dataDefinitionScheduleTimeList.DataItem.Id;
                $scope.dataDefinitionMaster.DataItem.ScheduleDate = $scope.dataDefinitionScheduleDateList.DataItem.Date;
                var startTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + $scope.dataDefinitionScheduleTimeList.DataItem.FromTime;
                var endTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + $scope.dataDefinitionScheduleTimeList.DataItem.ToTime;
                startTime = $filter('date')(new Date(startTime).getTime(), "hh:mm a");
                endTime = $filter('date')(new Date(endTime).getTime(), "hh:mm a");
                $scope.dataDefinitionMaster.DataItem.ScheduleTime = startTime + " - " + endTime;
                $scope.dataDefinitionMaster.DataItem.DentistName = $scope.dataDefinitionScheduleDateList.DataItem.DentistName;
            }
        }
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
            "Header": ['Date', 'Time', 'Dentist Name', 'Message', 'Status', 'Remarks', 'Remarks Date', 'No'],
            "Keys": ['ScheduleDate', 'ScheduleTime', 'DentistName', 'Message', 'Status', 'Remarks', 'TransactionDate'],
            "RequiredFields": ['ScheduleDate-Date', 'ScheduleTime-Time', 'DentistName-Dentist Name'],
            "Type": ['Date', 'Time', 'String', 'String-Default', 'Status-Approver', 'String-Default', 'Date'],
            "DataList": $scope.appointment,
            "CurrentLength": $scope.appointment.length,
            "APIUrl": ['/api/Appointments?length= &userId=' + $rootScope.user.Id,//get
                       '/api/Appointments' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenuLabel": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabelImage": ['mdi mdi-plus', 'mdi mdi-table-edit', 'mdi mdi-delete', 'mdi mdi-eye']
        };
        //Do Overriding or Overloading in this function
        $scope.otherActionsMaster = function (action) {
            switch (action) {
                case 'PostCreateAction':
                    $scope.initializeStatusHolder();
                    return true;
                case 'PostEditAction':
                    $scope.initializeStatusHolder();
                    return true;
                case 'PostViewAction':
                    $scope.initializeStatusHolder();
                    return true;
                case 'PostDeleteAction':
                    $scope.initializeStatusHolder();
                    return true;
                case 'PreSave':
                    delete $scope.dataDefinitionMaster.DataItem.Id;
                    $scope.dataDefinitionMaster.DataItem.PatientId = $rootScope.user.Id;
                    return true;
                case 'PreUpdate':
                    delete $scope.dataDefinitionMaster.DataItem.PatientDiagnosisHistoryMasters;
                    delete $scope.dataDefinitionMaster.DataItem.User;
                    delete $scope.dataDefinitionMaster.DataItem.ScheduleMaster;
                    delete $scope.dataDefinitionMaster.DataItem.ScheduleDetail;
                    $scope.closeForm();
                    return true;
                case 'PostSave':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.closeForm();
                    return true;
                case 'PostDelete':
                    $scope.closeForm();
                    return true;
                case 'PostLoadAction':
                    for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                        $scope.dataDefinitionMaster.DataList[i].DentistName = $scope.dataDefinitionMaster.DataList[i].ScheduleMaster.UserInformation.FirstName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].ScheduleMaster.UserInformation.MiddleName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].ScheduleMaster.UserInformation.LastName;
                        $scope.dataDefinitionMaster.DataList[i].ScheduleDate = $filter('date')($scope.dataDefinitionMaster.DataList[i].ScheduleMaster.Date, "MM/dd/yyyy");
                        var startTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " +  $scope.dataDefinitionMaster.DataList[i].ScheduleDetail.FromTime;
                        var endTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + $scope.dataDefinitionMaster.DataList[i].ScheduleDetail.ToTime;
                        startTime = $filter('date')(new Date(startTime).getTime(), "hh:mm a");
                        endTime = $filter('date')(new Date(endTime).getTime(), "hh:mm a");
                        $scope.dataDefinitionMaster.DataList[i].ScheduleTime = startTime + " - " + endTime;
                    }
                    return true;
                default:
                    return true;
            }
        };
        $scope.resetMasterItem = function () {
            $scope.dataDefinitionMaster.DataItem = {
                Id: null,
                PatientId: null,
                Message: null,
                ScheduleMasterId: null,
                ScheduleDetailId: null,
                ScheduleDate: null,
                ScheduleTime: null,
                DentistName: null,
                Status: 0,
                StatusHolder: 0
            }
        };
        $scope.showFormErrorMaster = function (message) {
            LxNotificationService.error(message);
        };
        //Close Forms and show main form
        $scope.closeForm = function () {
            $scope.showForm = false;
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
                    $scope.dataDefinitionMaster.DataItem.StatusHolder = "For Approval";
                    break;
                case 1:
                    $scope.dataDefinitionMaster.DataItem.StatusHolder = "Approved";
                    break;
                default: $scope.dataDefinitionMaster.DataItem.StatusHolder = "Disapproved";
                    break;
            }
        };
    };

    $scope.loadMaster();
    $scope.getScheduleDateList();
};