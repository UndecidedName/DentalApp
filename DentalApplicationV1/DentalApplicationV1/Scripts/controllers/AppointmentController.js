dentalApp.controller('AppointmentController', AppointmentController);
function AppointmentController($scope, LxNotificationService, LxDialogService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Set Appointment";
    $scope.showForm = false;

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
            "Header": ['Dentist Name', 'Appointment Date', 'Message', 'No'],
            "Keys": ['DentistName', 'AppointmentDate', 'Message'],
            "RequiredFields": ['DentistName-Dentist Name', 'AppointmentDate-Appointment Date'],
            "Type": ['String', 'Date', 'String-Default'],
            "DataList": $rootScope.appointment,
            "CurrentLength": $rootScope.appointment.length,
            "APIUrl": ['/api/Appointments?length=',//get
                       '/api/Appointments' //post, put, delete
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
                    $scope.dataDefinitionDetail.APIUrl = ['/api/ScheduleDetails?length= &masterId=' + $scope.dataDefinitionMaster.DataItem.Id,//get
                       '/api/ScheduleDetails' //post, put, delete
                    ];
                    return true;
                case 'PostDeleteAction':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
                    $scope.dataDefinitionDetail.APIUrl = ['/api/ScheduleDetails?length= &masterId=' + $scope.dataDefinitionMaster.DataItem.Id,//get
                       '/api/ScheduleDetails' //post, put, delete
                    ];
                    return true;
                case 'PreSave':
                    delete $scope.dataDefinitionMaster.DataItem.Id;
                    return true;
                case 'PostSave':
                    $scope.dataDefinitionMaster.DataItem.Date = $filter('date')($scope.dataDefinitionMaster.DataItem.Date, "MM/dd/yyyy");
                    $scope.tabPages = ['Date', 'Time'];
                    $scope.dataDefinitionDetail.APIUrl = ['/api/ScheduleDetails?length= &masterId=' + $scope.dataDefinitionMaster.DataItem.Id,//get
                       '/api/ScheduleDetails' //post, put, delete
                    ];
                    $scope.resetDetailItem();
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

    $scope.loadMaster();
};