dentalApp.controller('AppointmentReport1Controller', AppointmentReport1Controller);
function AppointmentReport1Controller($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Appointment Report";
    $scope.showForm = false;
    $scope.modalValue = "";
    //Show Modal
    $scope.showDialog = function (dialogId) {
        LxDialogService.open(dialogId);
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
            "DataItem": undefined,
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
            if (angular.isDefined($scope.dataDefinitionPatientList.DataItem)) {
                //Search From Source
                for (var i = 0; i < $scope.filterDefinition.Source.length; i++) {
                    if ($scope.modalValue == $scope.filterDefinition.Source[i].Values[0]) {
                        $scope.filterDefinition.Source[i].Values[1] = $scope.dataDefinitionPatientList.DataItem.UserId;
                        $scope.filterDefinition.Source[i].To = $scope.dataDefinitionPatientList.DataItem.FirstName + " " + $scope.dataDefinitionPatientList.DataItem.MiddleName + " " + $scope.dataDefinitionPatientList.DataItem.LastName;
                        i = $scope.filterDefinition.Source.length;
                    }
                }
            }
            LxDialogService.close(dialogId);
            //pass value here
        }
    };

    //Retrieve dentist lists
    $scope.getDentistList = function () {
        $scope.dentistList = [];
        $scope.dataDefinitionDentistList = {
            "Header": ['First Name', 'Middle Name', 'Last Name', 'Gender', 'Contact No.', 'No'],
            "Keys": ['FirstName', 'MiddleName', 'LastName', 'Gender', 'ContactNo'],
            "Type": ['String', 'String', 'String', 'Gender', 'Number'],
            "DataList": $scope.dentistList,
            "CurrentLength": $scope.dentistList.length,
            "DataItem": undefined,
            "APIUrl": ['/api/UserInformations?length= &userType=4&status=1'],
            "Dialog": "Dentists"
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

        $scope.otherActionDentist = function (action) {
            switch (action) {
                default: return true;
            }
        };

        $scope.closeDentist = function (dialogId) {
            //Search From Source
            if (angular.isDefined($scope.dataDefinitionDentistList.DataItem)) {
                for (var i = 0; i < $scope.filterDefinition.Source.length; i++) {
                    if ($scope.modalValue == $scope.filterDefinition.Source[i].Values[0]) {
                        $scope.filterDefinition.Source[i].Values[1] = $scope.dataDefinitionDentistList.DataItem.Id;
                        $scope.filterDefinition.Source[i].To = $scope.dataDefinitionDentistList.DataItem.FirstName + " " + $scope.dataDefinitionDentistList.DataItem.MiddleName + " " + $scope.dataDefinitionDentistList.DataItem.LastName;
                        i = $scope.filterDefinition.Source.length;
                    }
                }
            }
            LxDialogService.close(dialogId);
            //pass value here
        }
    };
    
    $scope.showFormErrorMaster = function (error) {
        LxNotificationService.error(error);
    };

    $scope.loadFiltering = function () {
        $scope.initFilterContainter();
        $scope.initFilteringParameters();
        $scope.initFilterDefinition();
        $scope.initDataItems();
    };

    $scope.initFilterContainter = function () {
        html = '<dir-filtering  filterdefinition="filterDefinition"' +
                                'filterlistener="filterListener"' +
                                'otheractions="otherActionsFilter(action)"' +
                                'showformerror="showFormErrorMaster(error)"' +
               '</dir-filtering>';
        $content = angular.element(document.querySelector('#filterContainter')).html(html);
        $compile($content)($scope);
    };

    $scope.initFilteringParameters = function () {
        $scope.filterListener = false;

        $scope.initFilterDefinition = function () {
            $scope.filterDefinition = {
                "DataList": [],
                "DataItem1": $scope.DataItem1,
                "DataItem2": $scope.DataItem2,
                "Url": '/api/Appointments?length=',//get
                "Source": [
                            { "Index": 0, "Label": "Date", "Property": "ScheduledDate", "Values": [], "From": null, "To": null, "Type": "Date" },
                            { "Index": 1, "Label": "Patient", "Property": "Patient", "Values": ['GetPatientList'], "From": null, "To": null, "Type": "Modal" },
                            { "Index": 2, "Label": "Dentist", "Property": "Dentist", "Values": ['GetDentistList'], "From": null, "To": null, "Type": "Modal" },
                            {
                                "Index": 3, "Label": "Status", "Property": "Status", "Values": [
                                                                                      { "Label": "For Approval", "Value": "0" },
                                                                                      { "Label": "Approved", "Value": "1" },
                                                                                      { "Label": "Disapproved", "Value": "2" }
                                ], "From": null, "To": null, "Type": "DropDown"
                            },
                            { "Index": 4, "Label": "Remarks Date", "Property": "TransactionDate", "Values": [], "From": null, "To": null, "Type": "Date" },
                ]
            }
        };

        $scope.otherActionsFilter = function (action) {
            switch (action) {
                //Initialize DataItem1 and DataItem2 for data filtering
                case 'PreFilterData':
                    $scope.source = $scope.filterDefinition.Source;
                    for (var i = 0; i < $scope.source.length; i++) {
                        switch ($scope.source[i].Property) {
                            case 'ScheduledDate':
                                $scope.filterDefinition.DataItem1.ScheduleMaster.Date = $scope.source[i].From;
                                $scope.filterDefinition.DataItem2.ScheduleMaster.Date = $scope.source[i].To;
                                break;
                            case 'Patient':
                                $scope.filterDefinition.DataItem1.PatientId = $scope.source[i].From;
                                break;
                            case 'Dentist':
                                if ($scope.filterDefinition.DataItem1.ScheduleMaster.DentistId == null)
                                    //Set status to 2147483647 as null because status will not accept null values in back-end as comparison
                                    $scope.filterDefinition.DataItem1.ScheduleMaster.DentistId = 2147483647;
                                else
                                    $scope.filterDefinition.DataItem1.ScheduleMaster.DentistId = $scope.source[i].From;
                                break;
                            case 'Status':
                                if ($scope.source[i].From == null)
                                    //Set status to 2147483647 as null because status will not accept null values in back-end as comparison
                                    $scope.filterDefinition.DataItem1.Status = 2147483647;
                                else
                                    $scope.filterDefinition.DataItem1.Status = $scope.source[i].From;
                                break;
                            default:
                                $scope.filterDefinition.DataItem1.TransactionDate = $scope.source[i].From;
                                $scope.filterDefinition.DataItem2.TransactionDate = $scope.source[i].To;
                                break;
                        }
                    }
                    return true;
                case 'LoadData':
                    return true;
                case 'GetPatientList':
                    //Use if filtering criteria is modal
                    $scope.modalValue = action;
                    $scope.getPatientList();
                    $scope.showDialog('Patients');
                    return true;
                case 'GetDentistList':
                        //Use if filtering criteria is modal
                        $scope.modalValue = action;
                        $scope.getDentistList();
                        $scope.showDialog('Dentists');
                        return true;
                default: return true;
            }
        }

        $scope.initDataItems = function () {
            $scope.appointmentItem = {
                //Patient Information
                "PatientId": null,
                "ScheduleMaster": {
                    //Appointment Date
                    "Date": null,
                    "DentistId": null
                },
                //Date that the appointment was approved or disapproved
                "TransactionDate": null,
                //Appointment Status
                "Status": null
            }
            $scope.filterDefinition.DataItem1 = angular.copy($scope.appointmentItem);
            $scope.filterDefinition.DataItem2 = angular.copy($scope.appointmentItem);
        };
    };

    $scope.loadDataGridReport = function () {
        $scope.initDataGridReportParameters();
        $scope.initDataGridReport();
    };

    $scope.initDataGridReport = function () {
        html = '<dir-data-grid-report datadefinition="dataDefinition" scrolled="filterListener"></dir-data-grid-report>';
        $content = angular.element(document.querySelector('#masterList')).html(html);
        $compile($content)($scope);
    }

    $scope.initDataGridReportParameters = function () {
        $scope.dataDefinition = {
            "Header":   ['Date',                'Start Time',               'End Time',                 'Status', 'Patient First Name',                 'Patient Middle Name',                  'Patient Last Name',                    'Dentist First Name',                       'Dentist Middle Name',                          'Dentist Last Name',                        'Message', 'Remarks', 'Remarks Date', 'No'],
            "Keys":     ['ScheduleMaster.Date', 'ScheduleDetail.FromTime',  'ScheduleDetail.ToTime',    'Status', 'User.UserInformations[0].FirstName', 'User.UserInformations[0].MiddleName',  'User.UserInformations[0].LastName',    'ScheduleMaster.UserInformation.FirstName', 'ScheduleMaster.UserInformation.MiddleName',    'ScheduleMaster.UserInformation.LastName',  'Message', 'Remarks', 'TransactionDate'],
            "Type":     ['Date',                'FormattedTime',            'FormattedTime',            'StatusTransaction', 'ProperCase',              'ProperCase',                           'ProperCase',                           'ProperCase',                               'ProperCase',                                   'ProperCase',                               'Default',  'Default', 'DateTime'],
            "ColWidth": [100,                   100,                        100,                        150,        200,                                200,                                    200,                                    200,                                        200,                                            200,                                         400,        400,       200],
            "DataList": [],
            "EnableScroll": true
        };
    };

    $scope.loadFiltering();
    $scope.loadDataGridReport();

    $interval(function () {
        //Note: If $scope.dataDefinition.DataList value was modified then update $scope.filterDefinition.DataList
        $scope.dataDefinition.DataList = angular.copy($scope.filterDefinition.DataList);
    }, 100);
}