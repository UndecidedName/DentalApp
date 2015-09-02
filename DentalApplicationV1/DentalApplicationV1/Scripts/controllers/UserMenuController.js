dentalApp.controller("UserMenuController", UserMenuController);
function UserMenuController(LxDialogService, LxNotificationService, LxDropdownService, $scope, $rootScope, $filter, Sidebar, $compile, $interval, $location, $http) {
    $scope.modelName = "User Menu";
    $scope.showForm = false;
    $scope.userTypeList = [];
    $scope.userMenu = [];

    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    };

    $scope.showDialog = function (dialogId) {
        $scope.dataDefinitionMenuList.DataItem = {};
        LxDialogService.open(dialogId);
    };

    //Retrieve active menu
    $scope.getMenuList = function () {
        $scope.menuList = [];
        $scope.dataDefinitionMenuList = {
            "Header": ['Menu Name', 'Description', 'Sequence', 'No'],
            "Keys": ['Name', 'Description', 'SeqNo'],
            "Type": ['String', 'String-Default', 'Number'],
            "DataList": $scope.menuList,
            "CurrentLength": $scope.menuList.length,
            "DataItem": {},
            "APIUrl": ['/api/DentalMenus?length= &status=1&type=all'],
            "Dialog": "Menu"
        };

        $scope.filterDefinitionMenu = {
            "Url": '/api/DentalMenus?length= &status=1&type=all',//get
            "Source": [
                        { "Label": "Menu Name", "Property": "Name", "Values": [], "Type": "Default" },
                        { "Label": "Description", "Property": "Description", "Values": [], "Type": "Default" }
            ]
        };

        $scope.otherActionMenu = function (action) {
            switch (action) {
                default: return true;
            }
        };

        $scope.closeMenu = function (dialogId) {
            $scope.dataDefinitionDetail.DataItem.Name = $scope.dataDefinitionMenuList.DataItem.Name;
            $scope.dataDefinitionDetail.DataItem.Description = $scope.dataDefinitionMenuList.DataItem.Description;
            $scope.dataDefinitionDetail.DataItem.MenuId = $scope.dataDefinitionMenuList.DataItem.Id;
            LxDialogService.close(dialogId);
        }
    };

    $scope.loadMaster = function () {
        $scope.scheduleMaster = [];
        $scope.loadMasterDataGrid();
        $scope.initMasterDataGridParameters();
    };
    $scope.loadMasterDataGrid = function () {
        html = '<dir-data-grid3 actioncreate="actionMaster"' +
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
                         '</dir-data-grid3>';
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
            "Keys": ['Name', 'Description', 'Status'],
            "RequiredFields": ['DentistName-Dentist Name'],
            "Type": ['String-Default', 'String-Default', 'Status-Maintenance'],
            "DataList": $scope.userTypeList,
            "CurrentLength": $scope.userTypeList.length,
            "APIUrl": ['/api/UserTypes?length=',//get
                       '/api/UserTypes' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenu": ['View'],
            "contextMenuLabel": ['Add Menu',],
            "contextMenuLabelImage": ['mdi mdi-plus']
        };

        $scope.filterDefinition = {
            "Url": '/api/CivilStatus?length= ',//get
            "Source": [
                        { "Label": "Name", "Property": "Name", "Values": [], "Type": "Default" },
                        { "Label": "Description", "Property": "Description", "Values": [], "Type": "Default" },
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
                case 'PostAction':
                    $scope.dataDefinitionMaster.DataItem.StatusHolder = ($scope.dataDefinitionMaster.DataItem.Status == 0 ? 'Inactive' : 'Active');
                    return true;
                case 'PostViewAction':
                    $scope.loadDetail();
                    $scope.dataDefinitionDetail.ViewOnly = true;
                    return true;
                default:
                    return true;
            }
        };
        $scope.resetMasterItem = function () {
            $scope.dataDefinitionMaster.DataItem = {
                Name: null,
                Description: null,
                Status: 0,
                StatusHolder: null
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
                $scope.userMenu = [];
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

    $scope.loadDetail = function () {
        $scope.scheduleDetail = [];
        $scope.loadDetailDataGrid();
        $scope.initDetailDataGridParameters();
    };
    $scope.loadDetailDataGrid = function () {
        html = '<dir-data-grid2 id="grid2" actioncreate="actionCreateDetail"' +
                         'datadefinition="dataDefinitionDetail"' +
                         'otheractions="otherActionsDetail(action)"' +
                         'submitbuttonlistener="submitButtonListenerDetail"' +
                         'showformerror="showFormErrorDetail(error)">' +
                         '</dir-data-grid2>';
        $content = angular.element(document.querySelector('#detailList')).html(html);
        $compile($content)($scope);
    };
    $scope.initDetailDataGridParameters = function () {
        $scope.actionCreateDetail = false;
        $scope.dataDefinitionDetail = {
            "Header": ['Menu Name', 'Description', 'Status', 'No'],
            "Keys": ['Name', 'Description', 'Status'],
            "Type": ['String', 'String-Default', 'Status-Maintenance'],
            "DataList": $scope.userMenu,
            "DataItem": {},
            "ViewOnly": false,
            "CurrentLength": $scope.userMenu.length,
            "APIUrl": ['/api/UserMenus?length= &userTypeId=' + $scope.dataDefinitionMaster.DataItem.Id,//get
                       '/api/UserMenus' //post, put, delete
            ],
            "ServerData": []
        };
        //Do Overriding or Overloading in this function
        $scope.otherActionsDetail = function (action) {
            switch (action) {
                case 'PostAction':
                    $scope.resetDetailItem();
                    return true;
                case 'PostLoadAction':
                    for (var i = 0; i < $scope.dataDefinitionDetail.DataList.length; i++)
                    {
                        $scope.dataDefinitionDetail.DataList[i].Name = $scope.dataDefinitionDetail.DataList[i].DentalMenu.Name;
                        $scope.dataDefinitionDetail.DataList[i].Description = $scope.dataDefinitionDetail.DataList[i].DentalMenu.Description;
                    }
                    return true;
                case 'PreSave':
                    delete $scope.dataDefinitionDetail.DataItem.Id;
                    $scope.dataDefinitionDetail.DataItem.UserTypeId = $scope.dataDefinitionMaster.DataItem.Id;
                    return true;
                case 'PostSave':
                    $scope.resetDetailItem();
                    return true;
                default: return true;
            }
        };
        $scope.resetDetailItem = function () {
            $scope.dataDefinitionDetail.DataItem = {
                Id: null,
                UserTypeId: null,
                MenudId: null,
                Name: null,
                Description: null,
                Status: 1
            }
        };
        $scope.showFormErrorDetail = function (message) {
            $scope.resetDetailItem();
            LxNotificationService.error(message);
            $scope.dataDefinitionDetail.DataItem.FromTime = $filter('date')(new Date($scope.fromSeconds), "hh:mm a");
            $scope.dataDefinitionDetail.DataItem.ToTime = $filter('date')(new Date($scope.toSeconds), "hh:mm a");
        };
        $scope.submitDetail = function () {
            $scope.submitButtonListenerDetail = true;
        };
    };

    $scope.loadMaster();
    $scope.getMenuList();
    $interval(function () {
        var width = window.innerWidth;
        if (width < 650) {
            $scope.checkBoxStyle = "";
            $scope.textBoxStyle = "";
        }
        else {
            $scope.checkBoxStyle = "padding-top:20px";
            $scope.textBoxStyle = "max-width:150px";
        }
    }, 100);
}