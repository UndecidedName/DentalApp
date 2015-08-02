dentalApp.controller('SpecialAppointmentsController', SpecialAppointmentsController);
function SpecialAppointmentsController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
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
                    for (var i = 0; i < $scope.scheduleMaster.length; i++) {
                        $scope.scheduleMaster[i].Date = $filter('date')($scope.scheduleMaster[i].Date, "MM/dd/yyyy");
                        $scope.scheduleMaster[i].DentistName = $scope.scheduleMaster[i].UserInformation.FirstName + " "
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
                LxProgressService.circular.show('#5fa2db', '#progress');
                //invoke patient modal
                var promise = $interval(function () {
                    $scope.getPatientList();
                    LxDialogService.open('Patients');
                    $interval.cancel(promise);
                    promise = undefined;
                    LxProgressService.circular.hide();
                }, 600);
            }
        }
    };

    //Retrieve patient lists
    $scope.getPatientList = function () {
        $scope.patientList = [];
        $scope.dataDefinitionPatientList = {
            "Header": ['First Name', 'Middle Name', 'Last Name', 'Gender', 'Contact No.', 'No'],
            "Keys": ['FirstName', 'MiddleName', 'LastName', 'Gender', 'ContactNo'],
            "Type": ['String', 'String', 'String', 'Gender', 'Number'],
            "DataList": $scope.patientList,
            "CurrentLength": $scope.patientList.length,
            "DataItem": {},
            "APIUrl": ['/api/UserInformations?length= &userType=6'],
            "Dialog": "Patients"
        };

        $scope.otherActionPatient = function (action) {
            switch (action) {
                default: return true;
            }
        };

        $scope.closePatient = function (dialogId) {
            LxDialogService.close(dialogId);
            $scope.dataDefinitionMaster.ViewOnly = false;
            //Initialize $scope.dataDefinitionMaster.DataItem
            if ($scope.dataDefinitionPatientList.DataItem.Id != null) {
                $scope.dataDefinitionMaster.DataItem.PatientId = $scope.dataDefinitionPatientList.DataItem.UserId;
                $scope.dataDefinitionMaster.DataItem.PatientName = $scope.dataDefinitionPatientList.DataItem.FirstName + " "
                                                                    + $scope.dataDefinitionPatientList.DataItem.MiddleName + " "
                                                                    + $scope.dataDefinitionPatientList.DataItem.LastName;
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
            "Header": ['Date', 'Time', 'Status', 'Patient Name', 'Dentist Name', 'Message', 'Remarks', 'Remarks Date', 'No'],
            "Keys": ['ScheduleDate', 'ScheduleTime', 'Status', 'PatientName', 'DentistName', 'Message', 'Remarks', 'TransactionDate'],
            "RequiredFields": ['Remarks-Remarks'],
            "Type": ['Date', 'Time', 'Status-Approver', 'String', 'String', 'String-Default', 'String-Default', 'Date'],
            "DataList": $scope.appointment,
            "CurrentLength": $scope.appointment.length,
            "APIUrl": ['/api/Appointments?length= &type=SpecialAppointments',//get
                       '/api/Appointments' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenu": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabel": ['Create', 'Edit', 'View'],
            "contextMenuLabelImage": ['mdi mdi-plus', 'mdi mdi-table-edit', 'mdi mdi-eye']
        };
        //Do Overriding or Overloading in this function
        $scope.otherActionsMaster = function (action) {
            switch (action) {
                case "PostAction":
                    $scope.dataDefinitionMaster.DataItem.TransactionDate = $filter('date')($scope.dataDefinitionMaster.DataItem.TransactionDate, "MM/dd/yyyy hh:mm:ss a")
                    return true;
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
                    $scope.dataDefinitionMaster.DataItem.User.UserTypeId = $rootScope.user.UserTypeId;
                    $scope.dataDefinitionMaster.DataItem.Message = "Special Appointment";
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
                    //Send notification to dentist(s) and secretar(y/ies)
                    for (var i = 0; i < $rootScope.usersForNotification.length; i++) {
                        $scope.notification = {
                            Date: $filter('date')(new Date(), "MM/dd/yyyy hh:mm:ss"),
                            Description: null,
                            UserId: $rootScope.usersForNotification[i].Id,
                            Status: 0
                        };
                        $scope.data = angular.copy($scope.dataDefinitionMaster.DataItem);
                        if ($rootScope.usersForNotification[i].Id != $rootScope.user.Id) {
                            var user = $rootScope.user.FirstName + " " +
                                        $rootScope.user.MiddleName + " " +
                                        $rootScope.user.LastName;
                        }
                        else {
                            var user = "You ";
                        }
                        $scope.notification.Description = user + " has set an appointment on " + $scope.data.ScheduleDate + " at "
                                                        + $scope.data.ScheduleTime + "."
                                                        + "for " + $scope.data.PatientName + ".";
                        $rootScope.sendNotification($scope.notification, $scope.notification.UserId.toString());
                    }
                    //Send notification to patient
                    $scope.notification = {
                        Date: $filter('date')(new Date(), "MM/dd/yyyy hh:mm:ss"),
                        Description: null,
                        UserId: $scope.dataDefinitionMaster.DataItem.PatientId,
                        Status: 0
                    };
                    $scope.data = angular.copy($scope.dataDefinitionMaster.DataItem);
                    var user = $rootScope.user.FirstName + " " +
                                $rootScope.user.MiddleName + " " +
                                $rootScope.user.LastName;

                    $scope.notification.Description = user + " has set an appointment on " + $scope.data.ScheduleDate + " at "
                                                    + $scope.data.ScheduleTime + " for you, please see remarks.";
                    $rootScope.sendNotification($scope.notification, $scope.notification.UserId.toString());
                    $scope.closeForm();
                    return true;
                case 'PreDelete':
                    if ($scope.dataDefinitionMaster.DataItem.Status == 2) {
                        $scope.showFormErrorMaster("Appointment is already disapproved, no need for you to cancel.");
                        return false;
                    }
                    else
                        return true;
                case 'PostDelete':
                    //Send notification to dentist(s) and secretar(y/ies)
                    for (var i = 0; i < $rootScope.usersForNotification.length; i++) {
                        $scope.notification = {
                            Date: $filter('date')(new Date(), "MM/dd/yyyy hh:mm:ss"),
                            Description: null,
                            UserId: $rootScope.usersForNotification[i].Id,
                            Status: 0
                        };
                        $scope.data = angular.copy($scope.dataDefinitionMaster.ServerData[0].objParam1);
                        var patient = $scope.data[0].User.UserInformations[0].FirstName + " " +
                                        $scope.data[0].User.UserInformations[0].MiddleName + " " +
                                        $scope.data[0].User.UserInformations[0].LastName;
                        var gender = ($scope.data[0].User.UserInformations[0].Gender == 'M' ? 'his' : 'her');
                        var date = $filter('date')($scope.data[0].ScheduleMaster.Date, "MM/dd/yyyy");
                        var startTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + $scope.data[0].ScheduleDetail.FromTime;
                        var endTime = new Date().getDate() + " " + new Date().getMonth() + " " + new Date().getFullYear() + " " + $scope.data[0].ScheduleDetail.ToTime;
                        startTime = $filter('date')(new Date(startTime).getTime(), "hh:mm a");
                        endTime = $filter('date')(new Date(endTime).getTime(), "hh:mm a");
                        $scope.notification.Description = patient + " has cancelled " + gender + " appointment on " + date + " at " + startTime + " - " + endTime;
                        //$scope.notification.Description =   patient +"'s appointment on " + date + " at " + startTime + " - "
                        //                                    + endTime + " has been cancelled.";
                        $rootScope.sendNotification($scope.notification, $scope.notification.UserId.toString());
                    }
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
                PatientName: null,
                Message: null,
                ScheduleMasterId: null,
                ScheduleDetailId: null,
                ScheduleDate: null,
                ScheduleTime: null,
                DentistName: null,
                User: { UserTypeId: null },
                Status: 1,
                Type: "SpecialAppointment",
                TransactionDate: $filter('date')(new Date(), "MM/dd/yyyy hh:mm:ss a"),
                StatusHolder: 1
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