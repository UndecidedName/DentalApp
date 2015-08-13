dentalApp.controller('UserInformationController', UserInformationController);
function UserInformationController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "User";
    $scope.showForm = false;
    $scope.userInformation = [];
    $scope.civilStatusList = [];
    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    };

    $scope.getCivilStatus = function () {
        $http.get('/api/CivilStatus')
        .success(function (data, status) {
            $scope.civilStatusList = angular.copy(data);
        })
    };
    $scope.getCivilStatus();
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
            "Header": ['Username', 'Password','Type', 'First Name', 'Middle Name', 'Last Name', 'Status', 'Contact Number', 'Email Address' ,'Gender', 'Height', 'Weight', 'Birthdate', 'Address', 'Civil Status', 'Occupation', 'No'],
            "Keys": ['Username', 'Password', 'Type', 'FirstName', 'MiddleName', 'LastName', 'Status', 'ContactNo', 'EmailAddress', 'Gender', 'Height', 'Weight', 'BirthDate', 'Address', 'CivilStatus', 'Occupation'],
            "Type": ['String-Default', 'String-Default', 'String', 'String', 'String', 'String', 'Status-Maintenance', 'Number', 'String-Default', 'Gender', 'Number', 'Number', 'Date', 'String', 'String', 'String'],
            "RequiredFields": ['FirstName-First Name'],
            "DataList": $scope.userInformation,
            "CurrentLength": $scope.userInformation.length,
            "APIUrl": ['api/Users?length=',//get
                       '/api/Users' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenu": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabel": ['Create', 'Edit', 'Delete', 'View'],
            "contextMenuLabelImage": ['mdi mdi-plus', 'mdi mdi-table-edit', 'mdi mdi-delete', 'mdi mdi-eye']
        };
        $scope.filterDefinition = {
            "Url": '/api/Users?length= ',//get
            "Source": [
                        { "Label": "Username", "Property": "UserName", "Values": [], "Type": "Default" },
                        { "Label": "First Name", "Property": "FirstName", "Values": [], "Type": "Default" },
                        { "Label": "Middle Name", "Property": "MiddleName", "Values": [], "Type": "Default" },
                        { "Label": "Last Name", "Property": "LastName", "Values": [], "Type": "Default" },
                        { "Label": "Email Address", "Property": "EmailAddress", "Values": [], "Type": "Default" },
                        {
                            "Label": "Gender", "Property": "Gender", "Values": [
                                                                                  { "Label": "Female", "Value": "F" },
                                                                                  { "Label": "Male", "Value": "M" }
                                                                                ], "Type": "DropDown"
                        },
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
                case 'PostLoadAction':
                    console.log($scope.dataDefinitionMaster.DataList);
                    var promise = $interval(function () {
                        if ($scope.dataDefinitionMaster.DataList.length > 0)
                        {
                            $interval.cancel(promise);
                            promise = undefined;
                            $scope.userInformation = $scope.dataDefinitionMaster.DataList;
                            for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++)
                            {
                                console.log(i);
                                $scope.dataDefinitionMaster.DataList[i].Type            = $scope.userInformation[i].UserType.Name;
                                $scope.dataDefinitionMaster.DataList[i].FirstName       = $scope.userInformation[i].UserInformations[0].FirstName;
                                $scope.dataDefinitionMaster.DataList[i].MiddleName      = $scope.userInformation[i].UserInformations[0].MiddleName;
                                $scope.dataDefinitionMaster.DataList[i].LastName        = $scope.userInformation[i].UserInformations[0].LastName;
                                $scope.dataDefinitionMaster.DataList[i].ContactNo       = $scope.userInformation[i].UserInformations[0].ContactNo;
                                $scope.dataDefinitionMaster.DataList[i].EmailAddress    = $scope.userInformation[i].UserInformations[0].EmailAddress;
                                $scope.dataDefinitionMaster.DataList[i].Gender          = $scope.userInformation[i].UserInformations[0].Gender;
                                $scope.dataDefinitionMaster.DataList[i].Height          = $scope.userInformation[i].UserInformations[0].Height;
                                $scope.dataDefinitionMaster.DataList[i].Weight          = $scope.userInformation[i].UserInformations[0].Weight;
                                $scope.dataDefinitionMaster.DataList[i].BirthDate       = $scope.userInformation[i].UserInformations[0].BirthDate;
                                $scope.dataDefinitionMaster.DataList[i].Address         = $scope.userInformation[i].UserInformations[0].Address;
                                $scope.dataDefinitionMaster.DataList[i].Occupation      = $scope.userInformation[i].UserInformations[0].Occupation;
                               
                                if ($scope.civilStatusList.length > 0)
                                {
                                    for (var j = 0; j < $scope.civilStatusList.length; j++)
                                    {
                                        if ($scope.civilStatusList[j].Id == $scope.userInformation[i].UserInformations[0].CivilStatusId)
                                        {
                                            $scope.dataDefinitionMaster.DataList[i].CivilStatus = $scope.civilStatusList[j].Name;
                                            j = $scope.civilStatusList.length;
                                        }
                                    }
                                }
                            }
                        }
                    }, 100);
                    break;
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
                    console.log($scope.dataDefinitionMaster.ServerData);
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