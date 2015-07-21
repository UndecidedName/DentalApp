dentalApp.controller('CivilStatusController', CivilStatusController);
function CivilStatusController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Civil Status";
    $scope.showForm = false;
    $scope.civilStatus = [];

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
            "Header": ['Name', 'Description', 'Status', 'No'],
            "Keys": ['Name', 'Description','Status'],
            "Type": ['String-Default', 'String-Default', 'Status-Maintenance'],
            "RequiredFields": ['Name-Name'],
            "DataList": $scope.civilStatus,
            "CurrentLength": $scope.civilStatus.length,
            "APIUrl": ['/api/CivilStatus?length=',//get
                       '/api/CivilStatus' //post, put, delete
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
                case 'PreAction':
                    $scope.resetMasterItem();
                    return true;
                case 'PostAction':
                    $scope.initializeStatusHolder();
                    return true;
                case 'PreSave':
                    delete $scope.dataDefinitionMaster.DataItem.Id;
                    return true;
                case 'PostSave':
                    $scope.closeForm();
                    return true;
                case 'PostDelete':
                    $scope.closeForm();
                    return true;
                case 'PostUpdate':
                    $scope.initializeDataGridMasterStatus();
                    $scope.closeForm();
                    return true;
                default:
                    return true;
            }
        };

        $scope.resetMasterItem = function () {
            $scope.dataDefinitionMaster.DataItem = {
                Id: null,
                Name: null,
                Description: null,
                Status: 1,
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
                    $scope.dataDefinitionMaster.DataItem.StatusHolder = false;
                    break;
                default:
                    $scope.dataDefinitionMaster.DataItem.StatusHolder = true;
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

    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $scope.checkBoxStyle = "";
            $scope.textBoxStyle = "";
        }
        else {
            $scope.checkBoxStyle = "padding-top:20px";
            $scope.textBoxStyle = "max-width:300px";
        }
        $scope.statusLabel = ($scope.dataDefinitionMaster.DataItem.StatusHolder == true ? 'Active' : 'Inactive');
        $scope.dataDefinitionMaster.DataItem.Status = ($scope.dataDefinitionMaster.DataItem.StatusHolder == true ? 1 : 0);
    }, 100);
}