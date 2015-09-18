dentalApp.controller('PDHController', PDHController);
function PDHController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Patient Diagnosis";
    $scope.showForm = false;
    $scope.tabPages = ['Information'];
    $scope.selectedTab = 0;
    $scope.addComma = false;
    $scope.submitButtonTextDetail = "Add";
    //Listen the changes of the scope
    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $rootScope.browserWidth = false;
            $scope.setStyle = "";
            $scope.setStyle1 = "";
        }
        else {
            $rootScope.browserWidth = true;
            $scope.setStyle = "width:200px; max-width:100%; padding-left:10px;";
            $scope.setStyle1 = "width:100px; max-width:100%;";
        }
    }, 100);

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
        for (var i = 0; i < $scope.tabPages.length; i++)
        {
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

    $scope.showDialog = function (dialogId) {
        if ($scope.dataDefinitionMaster.ViewOnly == false) {
            $scope.dataDefinitionMaster.ViewOnly = true;
            LxDialogService.open(dialogId);
        }
    };

    //Retrieve patient list
    $scope.getPatientList = function () {
        $scope.patientList = [];
        $scope.dataDefinitionPatientList = {
            "Header": ['First Name', 'Middle Name', 'Last Name', 'Gender', 'Contact No.', 'No'],
            "Keys": ['FirstName', 'MiddleName', 'LastName', 'Gender', 'ContactNo'],
            "Type": ['String', 'String', 'String', 'Gender', 'Number'],
            "DataList": $scope.patientList,
            "CurrentLength": $scope.patientList.length,
            "DataItem": {},
            "APIUrl": ['/api/UserInformations?length= &userType=6&status=1'],
            "Dialog": "Patients"
        };

        $scope.filterDefinitionPatient = {
            "Url": '/api/UserInformations?length= &userType=6&status=1',//get
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
                LxProgressService.circular.show('#5fa2db', '#progress');
                var promise = $interval(function () {
                    $scope.getAppointmentList();
                    LxDialogService.open('Appointments');
                    $interval.cancel(promise);
                    promise = undefined;
                    LxProgressService.circular.hide();
                }, 600);
            }
        }
    };

    //Retrieve patient appointment list
    $scope.getAppointmentList = function () {
        $scope.AppointmentList = [];
        $scope.dataDefinitionAppointmentList = {
            "Header": ['Date', 'Time', 'Dentist Name','No'],
            "Keys": ['AppointmentDate', 'AppointmentTime', 'DentistName'],
            "Type": ['Date', 'Default', 'String'],
            "DataList": $scope.AppointmentList,
            "CurrentLength": $scope.AppointmentList.length,
            "DataItem": {},
            "APIUrl": ['/api/Appointments?length= &userId=' + $scope.dataDefinitionMaster.DataItem.PatientId + '&status=1'],
            "Dialog": "Appointments"
        };

        $scope.filterDefinitionAppointment = {
            "Url": '/api/Appointments?length= &userId=' + $scope.dataDefinitionMaster.DataItem.PatientId + '&status=1',//get
            "Source": [
                            { "Label": "Date", "Property": "ScheduledDate", "Values": [], "Type": "Date" },
                            { "Label": "Start Time", "Property": "ScheduledFromTime", "Values": [], "Type": "Time" },
                            { "Label": "End Time", "Property": "ScheduledToTime", "Values": [], "Type": "Time" },
                            { "Label": "Patient First Name", "Property": "PatientFirstName", "Values": [], "Type": "Default" },
                            { "Label": "Patient Middle Name", "Property": "PatientMiddleName", "Values": [], "Type": "Default" },
                            { "Label": "Patient Last Name", "Property": "PatientLastName", "Values": [], "Type": "Default" },
                            { "Label": "Dentist First Name", "Property": "DentistFirstName", "Values": [], "Type": "Default" },
                            { "Label": "Dentist Middle Name", "Property": "DentistMiddleName", "Values": [], "Type": "Default" },
                            { "Label": "Dentist Last Name", "Property": "DentistLastName", "Values": [], "Type": "Default" }
            ]
        };

        $scope.otherActionAppointment = function (action) {
            switch (action) {
                case 'PostLoadAction':
                    for (var i = 0; i < $scope.dataDefinitionAppointmentList.DataList.length; i++) {
                        $scope.dataDefinitionAppointmentList.DataList[i].DentistName = $scope.dataDefinitionAppointmentList.DataList[i].ScheduleMaster.UserInformation.FirstName + " " +
                                                                              $scope.dataDefinitionAppointmentList.DataList[i].ScheduleMaster.UserInformation.MiddleName + " " +
                                                                              $scope.dataDefinitionAppointmentList.DataList[i].ScheduleMaster.UserInformation.LastName;
                        $scope.dataDefinitionAppointmentList.DataList[i].PatientName = $scope.dataDefinitionAppointmentList.DataList[i].User.UserInformations[0].FirstName + " " +
                                                                              $scope.dataDefinitionAppointmentList.DataList[i].User.UserInformations[0].MiddleName + " " +
                                                                              $scope.dataDefinitionAppointmentList.DataList[i].User.UserInformations[0].LastName;
                        $scope.dataDefinitionAppointmentList.DataList[i].AppointmentDate = $filter('date')($scope.dataDefinitionAppointmentList.DataList[i].ScheduleMaster.Date, "MM/dd/yyyy");
                        var startTime = new Date().getMonth() + "/" + new Date().getDate() + "/" + new Date().getFullYear() + " " + $scope.dataDefinitionAppointmentList.DataList[i].ScheduleDetail.FromTime;
                        var endTime = new Date().getMonth() + "/" + new Date().getDate() + "/" + new Date().getFullYear() + " " + $scope.dataDefinitionAppointmentList.DataList[i].ScheduleDetail.ToTime;
                        startTime = $filter('date')(new Date(startTime).getTime(), "hh:mm a");
                        endTime = $filter('date')(new Date(endTime).getTime(), "hh:mm a");
                        $scope.dataDefinitionAppointmentList.DataList[i].AppointmentTime = startTime + " - " + endTime;
                    }
                    return true;
                default: return true;
            }
        };

        $scope.closeAppointment = function (dialogId) {
            LxDialogService.close(dialogId);
            $scope.dataDefinitionMaster.ViewOnly = false;
            if ($scope.dataDefinitionAppointmentList.DataItem.Id != null) {
                $scope.dataDefinitionMaster.DataItem.AppointmentId = $scope.dataDefinitionAppointmentList.DataItem.Id;
                $scope.dataDefinitionMaster.DataItem.AppointmentDate = $scope.dataDefinitionAppointmentList.DataItem.AppointmentDate;
                $scope.dataDefinitionMaster.DataItem.AppointmentTime = $scope.dataDefinitionAppointmentList.DataItem.AppointmentTime;
                $scope.dataDefinitionMaster.DataItem.DentistName = $scope.dataDefinitionAppointmentList.DataItem.DentistName;
            }
        }
    };

    //Retrieve treatment type list
    $scope.getTreatmentTypeList = function () {
        $scope.treatmentTypeList = [];
        $scope.dataDefinitionTreatmentTypeList = {
            "Header": ['Name', 'Description','No'],
            "Keys": ['Name', 'Description'],
            "Type": ['String', 'Default'],
            "DataList": $scope.treatmentTypeList,
            "CurrentLength": $scope.treatmentTypeList.length,
            "DataItem": {},
            "APIUrl": ['/api/TreatmentTypes?length= &status=1'],
            "Dialog": "TreatmentType"
        };

        $scope.filterDefinitionTreatmentType = {
            "Url": '/api/TreatmentTypes?length= &status=1',//get
            "Source": [
                            { "Label": "Name", "Property": "Name", "Values": [], "Type": "Default" },
                            { "Label": "Description", "Property": "Description", "Values": [], "Type": "Default" }
            ]
        };

        $scope.otherActionTreatmentTypeList = function (action) {
            switch (action) {
                default: return true;
            }
        };

        $scope.closeTreatmentTypeList = function (dialogId) {
            LxDialogService.close(dialogId);
            $scope.dataDefinitionMaster.ViewOnly = false;
            $scope.dataDefinitionDetail.DataItem.TreatmentTypeId = $scope.dataDefinitionTreatmentTypeList.DataItem.Id;
            $scope.dataDefinitionDetail.DataItem.TreatmentTypeName = $scope.dataDefinitionTreatmentTypeList.DataItem.Name;
        }
    };

    $scope.initializeBalance = function () {
        $scope.dataDefinitionMaster.DataItem.Balance = $filter('number')($scope.dataDefinitionMaster.DataItem.Fee - $scope.dataDefinitionMaster.DataItem.Paid, 4);
    };

    $scope.loadMaster = function () {
        $scope.pdhMaster = [];
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
            "Header": ['Patient', 'Appointment Date',  'Appointment Time', 'Dentist', 'Fee', 'Paid', 'Balance', 'Notes', 'No'],
            "Keys": ['PatientName', 'AppointmentDate', 'AppointmentTime', 'DentistName', 'Fee', 'Paid', 'Balance', 'Notes'],
            "RequiredFields": ['PatientName-Patient', 'AppointmentDate-Appointment', 'Fee-Fee'],
            "Type": ['String', 'Date', 'Default', 'String', 'Decimal', 'Decimal', 'Decimal', 'Default'],
            "DataList": $scope.pdhMaster,
            "CurrentLength": $scope.pdhMaster.length,
            "APIUrl": ['/api/PatientDiagnosisHistoryMasters?length=',//get
                       '/api/PatientDiagnosisHistoryMasters' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenu": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabel": ['Create', 'Edit', 'Cancel', 'View'],
            "contextMenuLabelImage": ['mdi mdi-plus', 'mdi mdi-table-edit', 'mdi mdi-delete', 'mdi mdi-eye']
        };

        $scope.filterDefinition = {
            "Url": '/api/PatientDiagnosisHistoryMasters?length= ',//get
            "Source": [
                        { "Label": "Patient First Name", "Property": "PatientFirstName", "Values": [], "Type": "Default" },
                        { "Label": "Patient Middle Name", "Property": "PatientMiddleName", "Values": [], "Type": "Default" },
                        { "Label": "Patient Last Name", "Property": "PatientLastName", "Values": [], "Type": "Default" },
                        { "Label": "Dentist First Name", "Property": "DentistFirstName", "Values": [], "Type": "Default" },
                        { "Label": "Dentist Middle Name", "Property": "DentistMiddleName", "Values": [], "Type": "Default" },
                        { "Label": "Dentist Last Name", "Property": "DentistLastName", "Values": [], "Type": "Default" },
                        { "Label": "Appointment Date", "Property": "AppointmentDate", "Values": [], "Type": "Date" },
                        { "Label": "Appointment Start Time", "Property": "AppointmentFromTime", "Values": [], "Type": "Time" },
                        { "Label": "Appointment End Time", "Property": "AppointmentToTime", "Values": [], "Type": "Time" }
            ]
        };

        //Do Overriding or Overloading in this function
        $scope.otherActionsMaster = function (action) {
            switch (action) {
                case 'PreCreateAction':
                    $scope.tabPages = ['Information'];
                    $scope.selectedTab = 0;
                    return true;
                case 'PostEditAction':
                    $scope.tabPages = ['Information', 'Detail'];
                    $scope.loadDetail();
                    return true;
                case 'PostViewAction':
                    $scope.tabPages = ['Information', 'Detail'];
                    $scope.loadDetail();
                    //$scope.dataDefinitionDetail.ViewOnly = true;
                    return true;
                case 'PostDeleteAction':
                    $scope.tabPages = ['Information', 'Detail'];
                    $scope.loadDetail();
                    //$scope.dataDefinitionDetail.ViewOnly = true;
                    return true;
                case 'PreSave':
                    delete $scope.dataDefinitionMaster.DataItem.Id;
                    return true;
                case 'PostSave':
                    $scope.tabPages = ['Information', 'Detail'];
                    $scope.loadDetail();
                    $scope.selectedTab = 1;
                    return true;
                case 'PreUpdate':
                    delete $scope.dataDefinitionMaster.DataItem.Appointment;
                    delete $scope.dataDefinitionMaster.DataItem.PatientDiaganosisHistoryDetail;
                    delete $scope.dataDefinitionMaster.DataItem.User;
                    return true;
                case 'PostUpdate':
                    $scope.closeForm();
                    return true;
                case 'PostDelete':
                    $scope.closeForm();
                    return true;
                case 'PostLoadAction':
                    for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                        $scope.dataDefinitionMaster.DataList[i].PatientName = $scope.dataDefinitionMaster.DataList[i].User.UserInformations[0].FirstName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].User.UserInformations[0].MiddleName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].User.UserInformations[0].LastName;
                        $scope.dataDefinitionMaster.DataList[i].DentistName = $scope.dataDefinitionMaster.DataList[i].Appointment.ScheduleMaster.UserInformation.FirstName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].Appointment.ScheduleMaster.UserInformation.MiddleName + " " +
                                                                              $scope.dataDefinitionMaster.DataList[i].Appointment.ScheduleMaster.UserInformation.LastName;
                        $scope.dataDefinitionMaster.DataList[i].AppointmentDate = $filter('date')($scope.dataDefinitionMaster.DataList[i].Appointment.ScheduleMaster.Date, "MM/dd/yyyy");
                        var startTime = new Date().getMonth() + "/" + new Date().getDate() + "/" + new Date().getFullYear() + " " + $scope.dataDefinitionMaster.DataList[i].Appointment.ScheduleDetail.FromTime;
                        var endTime = new Date().getMonth() + "/" + new Date().getDate() + "/" + new Date().getFullYear() + " " + $scope.dataDefinitionMaster.DataList[i].Appointment.ScheduleDetail.ToTime;
                        startTime = $filter('date')(new Date(startTime).getTime(), "hh:mm a");
                        endTime = $filter('date')(new Date(endTime).getTime(), "hh:mm a");
                        $scope.dataDefinitionMaster.DataList[i].AppointmentTime = startTime + " - " + endTime;
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
                AppointmentId: null,
                AppointmentDate: null,
                AppointmentTime: null,
                DentistName: null,
                Fee: 0,
                Paid: 0,
                Balance: 0,
                Notes: null,
                Status: 1
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

    };

    $scope.loadDetail = function () {
        $scope.pdhDetail = [];
        $scope.loadDetailDataGrid();
        $scope.initDetailDataGridParameters();
    };
    $scope.loadDetailDataGrid = function () {
        html = '<dir-data-grid4 id="grid2" actioncreate="actionCreateDetail"' +
                         'datadefinition="dataDefinitionDetail"' +
                         'otheractions="otherActionsDetail(action)"' +
                         'submitbuttonlistener="submitButtonListenerDetail"' +
                         'showformerror="showFormErrorDetail(error)">' +
                         '</dir-data-grid4>';
        $content = angular.element(document.querySelector('#detailList')).html(html);
        $compile($content)($scope);
    };
    $scope.initDetailDataGridParameters = function () {
        $scope.actionCreateDetail = false;
        $scope.dataDefinitionDetail = {
            "Header": ['Treatment', 'Diagnosis', 'Diagnosed Teeth', 'No'],
            "Keys": ['TreatmentTypeName', 'Diagnosis', 'DiagnosedTeeth'],
            "Type": ['String', 'Default', 'String'],
            "RequiredFields": ['TreatmentTypeName-Treatment Type', 'Diagnosis-Diagnosis', 'DiagnosedTeeth-DiagnosedTeeth'],
            "DataList": $scope.pdhDetail,
            "DataItem": {},
            "ViewOnly": false,
            "CurrentLength": $scope.pdhDetail.length,
            "APIUrl": ['/api/PatientDiagnosisHistoryDetails?length= &masterId=' + $scope.dataDefinitionMaster.DataItem.Id,//get
                       '/api/PatientDiagnosisHistoryDetails' //post, put, delete
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
                case 'PostLoadAction':
                    for (var i = 0; i < $scope.dataDefinitionDetail.DataList.length; i++) {
                        $scope.dataDefinitionDetail.DataList[i].TreatmentTypeName = $scope.dataDefinitionDetail.DataList[i].TreatmentType.Name;
                    }
                    return true;
                case 'PostEditAction':
                    $scope.submitButtonTextDetail = "Edit";
                    return true;
                case 'PreSave':
                    delete $scope.dataDefinitionDetail.DataItem.Id;
                    $scope.dataDefinitionDetail.DataItem.PDHMasterId = $scope.dataDefinitionMaster.DataItem.Id;
                    return true;
                case 'PostSave':
                    $scope.resetDetailItem();
                    return true;
                case 'PostUpdate':
                    $scope.resetDetailItem();
                    $scope.submitButtonTextDetail = "Add";
                    return true;
                case 'PostSubmit':
                    return true;
                default: return true;
            }
        };

        $scope.resetDetailItem = function () {
            $scope.dataDefinitionDetail.DataItem = {
                Id: null,
                PDHMasterId: null,
                TreatmentTypeId: null,
                TreatmentTypeName: null,
                DiagnosedTeeth: null
            }
        };
        $scope.showFormErrorDetail = function (message) {
            $scope.resetDetailItem();
            LxNotificationService.error(message);
        };
        $scope.submitDetail = function () {
            $scope.submitButtonListenerDetail = true;
        };
    };

    //Find specific character
    $scope.findCharacter = function (v, c) {
        for (var i = 0; i < v.length; i++) {
            if (v.charAt(i) == c)
                return true;
        }
        return false;
    };

    $scope.filterCharacters = function () {
        $scope.addComma = false;
        $("#PatientName,#Treatment").keypress(function (key) {
            return false;
        });

        //Check if input doesn't contain special characters
        $("#Notes, #Diagnosis").keypress(function (key) {
            if (!((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) && (key.charCode != 32)))
                return true;
            else if (key.charCode == 46 || key.charCode == 0)
                return true;
            else {
                if (!(key.charCode < 48 || key.charCode > 57))
                    return true;
            }
            return false;
        });

        //Check if input is decimal number only
        $('#Fee,#Paid').keypress(function (key) {
            if (key.charCode == 46) {
                if ($scope.findCharacter(this.value, '.'))
                    return false;
                else
                    return true;
            }
            else if (key.charCode < 48 || key.charCode > 57)
                return false;
            else
                return true;
        });

        //Check if input is whole number  or comma
        $('#DiagnosedTeeth').keypress(function (key) {
            if ((key.charCode < 48 || key.charCode > 57) && key.charCode != 44)
                return false;
        });
    };

    $rootScope.manipulateDOM();
    $scope.getPatientList();
    $scope.getTreatmentTypeList();
    $scope.loadMaster();
    $scope.setSelectedTabStyle();
}