dentalApp.controller('AppointmentApprovalController', NotificationController);
function NotificationController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Appointment Approval";
    $scope.showForm = false;
    $scope.appointment = [];
    $scope.notification = {};

    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $scope.checkBoxStyle = "";
        }
        else {
            $scope.checkBoxStyle = "padding-top:40px";
        }
        $scope.transactionStatusLabel = ($scope.dataDefinitionMaster.DataItem.TransactionStatus == true ? 'Approved' : 'Disapproved');
    }, 100);

    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    };

    $scope.loadMaster = function () {
        $scope.loadMasterDataGrid();
        $scope.initMasterDataGridParameters();
    };
    $scope.loadMasterDataGrid = function () {
        html = '<dir-data-grid3 actioncreate="actionMaster"' +
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
                         '</dir-data-grid3>';
        $content = angular.element(document.querySelector('#masterList')).html(html);
        $compile($content)($scope);
    };
    $scope.initMasterDataGridParameters = function () {
        $scope.submitButtonText = "Edit";
        $scope.submitButtonListenerMaster = false;
        $scope.errorMessageMaster = "";
        $scope.actionCreateMaster = false;
        $scope.actionModeMaster = "Edit";//default to Create
        $scope.dataDefinitionMaster = {
            "Header": ['Date', 'Time', 'Status', 'Patient Name', 'Dentist Name', 'Message', 'Remarks', 'Remarks Date', 'No'],
            "Keys": ['ScheduleDate', 'ScheduleTime', 'Status', 'PatientName', 'DentistName', 'Message', 'Remarks', 'TransactionDate'],
            "RequiredFields": ['Remarks-Remarks'],
            "Type": ['Date', 'Time', 'Status-Approver', 'String', 'String', 'String-Default', 'String-Default', 'Date'],
            "DataList": $scope.appointment,
            "CurrentLength": $scope.appointment.length,
            "APIUrl": ['/api/Appointments?length= &type=AllAppointments',//get
                       '/api/Appointments' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenu": ['Edit', 'View'],
            "contextMenuLabel": ['Decide','View'],
            "contextMenuLabelImage": ['mdi mdi-table-edit', 'mdi mdi-eye']
        };
        //Do Overriding or Overloading in this function
        $scope.otherActionsMaster = function (action) {
            switch (action) {
                case 'PreAction':
                    $scope.resetMasterItem();
                    return true;
                case 'PostAction':
                    $scope.initializeStatusHolder();
                    $scope.dataDefinitionMaster.DataItem.TransactionDate = $filter('date')(new Date(), "MM/dd/yyyy hh:mm:ss");
                    return true;
                case 'PostEditAction':
                    //$scope.dataDefinitionMaster.ViewOnly = ($scope.dataDefinitionMaster.DataItem.Status == 0 ? false : true);
                    $scope.dataDefinitionMaster.DataItem.TransactionStatus = ($scope.dataDefinitionMaster.DataItem.Status == 1 ? true :
                                                                             ($scope.dataDefinitionMaster.DataItem.Status == 0 ? true : false));
                    $scope.dataDefinitionMaster.DataItem.Remarks = ($scope.dataDefinitionMaster.DataItem.Status == 0 ? "" : $scope.dataDefinitionMaster.DataItem.Remarks);
                    return true;
                case 'PostViewAction':
                    $scope.dataDefinitionMaster.ViewOnly = true;
                    $scope.dataDefinitionMaster.DataItem.Remarks = ($scope.dataDefinitionMaster.DataItem.Status == 0 ? "" : $scope.dataDefinitionMaster.DataItem.Remarks);
                    $scope.dataDefinitionMaster.DataItem.TransactionStatus = ($scope.dataDefinitionMaster.DataItem.Status == 1 ? true :
                                                                             ($scope.dataDefinitionMaster.DataItem.Status == 0 ? true : false));
                    return true;
                case 'PreUpdate':
                        delete $scope.dataDefinitionMaster.DataItem.PatientDiagnosisHistoryMasters;
                        delete $scope.dataDefinitionMaster.DataItem.User;
                        delete $scope.dataDefinitionMaster.DataItem.ScheduleMaster;
                        delete $scope.dataDefinitionMaster.DataItem.ScheduleDetail;
                        //if approve set status to 1 for approve else 2 for disapprove
                        $scope.dataDefinitionMaster.DataItem.Status = ($scope.dataDefinitionMaster.DataItem.TransactionStatus == true ? 1 : 2);
                        return true;
                case 'PostUpdate':
                    $scope.initializeDataGridMasterStatus();
                    $scope.notification = {
                        Date: $filter('date')(new Date(), "MM/dd/yyyy hh:mm:ss a"),
                        Description: null,
                        UserId: $scope.dataDefinitionMaster.DataItem.PatientId,
                        Status: 0
                    };
                    $scope.data = angular.copy($scope.dataDefinitionMaster.ServerData[0].objParam1);
                    var date = $filter('date')($scope.data[0].ScheduleMaster.Date, "MM/dd/yyyy");
                    var startTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + $scope.data[0].ScheduleDetail.FromTime;
                    var endTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + $scope.data[0].ScheduleDetail.ToTime;
                    startTime = $filter('date')(new Date(startTime).getTime(), "hh:mm a");
                    endTime = $filter('date')(new Date(endTime).getTime(), "hh:mm a");
                    $scope.notification.Description = "Your appointment on " + date + " at " + startTime + " - "
                                       + endTime + " has been" + ($scope.data[0].Status == 1 ? ' approved,' : ' disapproved,') + " please see remarks.";
                    $rootScope.sendNotification($scope.notification, $scope.notification.UserId.toString());
                    $scope.closeForm();
                    return true;
                case 'PostLoadAction':
                    for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                        $scope.dataDefinitionMaster.DataList[i].DentistName = $scope.dataDefinitionMaster.DataList[i].ScheduleMaster.UserInformation.FirstName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].ScheduleMaster.UserInformation.MiddleName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].ScheduleMaster.UserInformation.LastName;
                        $scope.dataDefinitionMaster.DataList[i].PatientName = $scope.dataDefinitionMaster.DataList[i].User.UserInformations[0].FirstName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].User.UserInformations[0].MiddleName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].User.UserInformations[0].LastName;
                        $scope.dataDefinitionMaster.DataList[i].ScheduleDate = $filter('date')($scope.dataDefinitionMaster.DataList[i].ScheduleMaster.Date, "MM/dd/yyyy");
                        var startTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + $scope.dataDefinitionMaster.DataList[i].ScheduleDetail.FromTime;
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
                Remarks: null,
                TransactionDate: null,
                Status: 0,
                ScheduleDate: null,
                ScheduleTime: null,
                PatientName: null,
                DentistName: null,
                StatusHolder: 0,
                TransactionStatus: null
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

        $scope.initializeDataGridMasterStatus = function () {
            for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                if ($scope.dataDefinitionMaster.DataItem.Id == $scope.dataDefinitionMaster.DataList[i].Id) {
                    $scope.dataDefinitionMaster.DataList[i].Status = $scope.dataDefinitionMaster.DataItem.Status;
                    $scope.initializeStatusHolder();
                    i = $scope.dataDefinitionMaster.DataList.length;
                }
            }
        };
    };

    $scope.loadMaster();

};