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
            "Header": ['Parent Menu', 'Name', 'Description', 'Url', 'Sequence', 'No'],
            "Keys": ['ParentName', 'Name', 'Description', 'Url', 'SeqNo'],
            "Type": ['String-Default', 'String-Default', 'String-Default', 'String-Default-Default', 'Number'],
            "DataList": $scope.menuList,
            "CurrentLength": $scope.menuList.length,
            "DataItem": {},
            "APIUrl": ['/api/DentalMenus?length= &status=1&type=parent'],
            "Dialog": "Menu"
        };

        $scope.filterDefinitionMenu = {
            "Url": '/api/DentalMenus?length= &status=1&type=parent',//get
            "Source": [
                        { "Label": "Menu Name", "Property": "Name", "Values": [], "Type": "Default" },
                        { "Label": "Description", "Property": "Description", "Values": [], "Type": "Default" }
            ]
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
            "Header": ['Parent Name', 'Name', 'Description', 'Url', 'Sequence', 'Status', 'No'],
            "Keys": ['ParentName', 'Name', 'Description', 'Url', 'SeqNo','Status'],
            "Type": ['String-Default', 'String-Default', 'String-Default', 'String-Default', 'Number', 'Status-Maintenance'],
            "RequiredFields": ['Name-Name', 'Url-Url', 'SeqNo-Sequence'],
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
                    if ($scope.dataDefinitionMaster.DataItem.ParentId == null || $scope.dataDefinitionMaster.DataItem.ParentId == "")
                        $scope.dataDefinitionMaster.DataItem.ParentId = 0;
                    console.log($scope.dataDefinitionMaster.DataItem.ParentId);
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
                    //Initialize menu parent
                    for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                        if ($scope.dataDefinitionMaster.DataList[i].ParentId == 1)
                            $scope.dataDefinitionMaster.DataList[i].ParentName = "Transaction";
                        else if ($scope.dataDefinitionMaster.DataList[i].ParentId == 2)
                            $scope.dataDefinitionMaster.DataList[i].ParentName = "Maintenance";
                        else
                            $scope.dataDefinitionMaster.DataList[i].ParentName = "";
                    }
                    return true;
                default:
                    return true;
            }
        };

        $scope.resetMasterItem = function () {
            $scope.dataDefinitionMaster.DataItem = {
                Id: null,
                ParentId: 0,
                Name: null,
                Description: null,
                Url: null,
                SeqNo: null,
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

    //Find specific character
    $scope.findCharacter = function (v, c) {
        for (var i = 0; i < v.length; i++) {
            if (v.charAt(i) == c)
                return true;
        }
        return false;
    };

    $scope.filterCharacters = function () {
        //Check if input contains letter only
        $("#name,#description").keypress(function (key) {
            if ((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) && (key.charCode != 32)) return false;
        });

        //Check if input is whole number
        $('#sequence').keypress(function (key) {
            if (key.charCode < 48 || key.charCode > 57) return false;
        });

        //Check if input doesn't contain special character
        $("#url").keypress(function (key) {
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
    };

    $scope.loadMaster();
    $scope.getMenuList();
};