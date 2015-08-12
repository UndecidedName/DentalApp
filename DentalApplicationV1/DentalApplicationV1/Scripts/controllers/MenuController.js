dentalApp.controller('MenuController', MenuController);
function MenuController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "Menu Maintenance";
    $scope.showForm = false;
    $scope.menu = [];

    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $scope.checkBoxStyle = "";
        }
        else {
            $scope.checkBoxStyle = "padding-top:20px";
        }
        $scope.statusLabel = ($scope.dataDefinitionMaster.DataItem.StatusHolder == true ? 'Active' : 'Inactive');
        $scope.dataDefinitionMaster.DataItem.Status = ($scope.dataDefinitionMaster.DataItem.StatusHolder == true ? 1 : 0);
    }, 100);

    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    };

    $scope.showDialog = function (dialogId) {
        LxDialogService.open(dialogId);
    };

    //Retrieve open schedule Master, include dentistinformation
    $scope.getMenuList = function () {
        $scope.menuList = [];
        $scope.dataDefinitionMenuList = {
            "Header": ['Parent Menu', 'Name', 'Description', 'Url', 'No'],
            "Keys": ['ParentName', 'Name', 'Description', 'Url'],
            "Type": ['String-Default', 'String-Default', 'String-Default', 'String-Default-Default'],
            "DataList": $scope.menuList,
            "CurrentLength": $scope.menuList.length,
            "DataItem": {},
            "APIUrl": ['/api/DentalMenus?length= &status=1'],
            "Dialog": "Menu"
        };

        $scope.otherActionMenu = function (action) {
            switch (action) {
                case 'PostLoadAction':
                    //Initialize menu parent
                    for (var i = 0; i < $scope.dataDefinitionMenuList.DataList.length; i++) {
                        for (var j = 0; j < $scope.menuList.length; j++) {
                            if ($scope.dataDefinitionMenuList.DataList[i].ParentId == $scope.menuList[j].Id) {
                                $scope.dataDefinitionMenuList.DataList[i].ParentName = $scope.menuList[i].Name;
                                j = $scope.menuList.length;
                            }
                        }
                    }
                    return true;
                default: return true;
            }
        };

        $scope.closeMenu = function (dialogId) {
            LxDialogService.close(dialogId);
            $scope.dataDefinitionMaster.DataItem.ParentId = $scope.dataDefinitionMenuList.DataItem.Id;
            $scope.dataDefinitionMaster.DataItem.ParentName = $scope.dataDefinitionMenuList.DataItem.Name;
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
            "Header": ['Parent Name', 'Name', 'Description', 'Url', 'Status', 'No'],
            "Keys": ['ParentName', 'Name', 'Description', 'Url','Status'],
            "Type": ['String-Default', 'String-Default', 'String-Default', 'String-Default', 'Status-Maintenance'],
            "RequiredFields": ['Name-Name', 'Url-Url'],
            "DataList": $scope.menu,
            "CurrentLength": $scope.menu.length,
            "APIUrl": ['/api/DentalMenus?length=',//get
                       '/api/DentalMenus' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenu": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabel": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabelImage": ['mdi mdi-plus', 'mdi mdi-table-edit', 'mdi mdi-delete', 'mdi mdi-eye']
        };

        $scope.filterDefinition = {
            "Url": '/api/DentalMenus?length= ',//get
            "Source": [
                        {
                            "Label": "Parent Name", "Property": "ParentName", "Values": [
                                                                                  { "Label": "Maintenance", "Value": "2" },
                                                                                  { "Label": "Transaction", "Value": "1" }
                            ], "Type": "DropDown"
                        },
                        { "Label": "Name", "Property": "Name", "Values": [], "Type": "Default" },
                        { "Label": "Description", "Property": "Description", "Values": [], "Type": "Default" },
                        { "Label": "Url", "Property": "Url", "Values": [], "Type": "Default" },
                        {
                            "Label": "Status", "Property": "Status", "Values": [
                                                                                  { "Label": "Active", "Value": "1" },
                                                                                  { "Label": "Inactive", "Value": "0" }
                            ], "Type": "DropDown"
                        }
            ]
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
                case 'PostLoadAction':
                    console.log($scope.dataDefinitionMaster.DataList.length);
                    //Initialize menu parent
                    for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                        //for (var j = 0; j < $scope.dataDefinitionMaster.DataList.length; j++) {
                            if ($scope.dataDefinitionMaster.DataList[i].ParentId == 1)
                                $scope.dataDefinitionMaster.DataList[i].ParentName = "Transaction";
                            else
                                $scope.dataDefinitionMaster.DataList[i].ParentName = "Maintenance";
                        //}
                    }
                    return true;
                default:
                    return true;
            }
        };

        $scope.resetMasterItem = function () {
            $scope.dataDefinitionMaster.DataItem = {
                Id: null,
                ParentId: null,
                Name: null,
                Description: null,
                Url: null,
                Status: 1,
                ParentName: null,
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
    $scope.getMenuList();
};