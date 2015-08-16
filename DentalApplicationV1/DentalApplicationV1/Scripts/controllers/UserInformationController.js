dentalApp.controller('UserInformationController', UserInformationController);
function UserInformationController($scope, LxNotificationService, LxDialogService, LxProgressService, $interval, $filter, $http, $rootScope, $compile) {
    $scope.modelName = "User";
    $scope.showForm = false;
    $scope.userInformation = [];
    $scope.civilStatusList = [];
    $scope.userTypeList = [];

    $scope.showDialog = function (dialogId) {
        LxDialogService.open(dialogId);
    };

    $scope.closeDate = function (dialogId) {
        var promise = $interval(function () {
            $scope.dataDefinitionMaster.DataItem.BirthDate = "";
            $scope.dataDefinitionMaster.DataItem.BirthDateHolder = $filter('date')($scope.dataDefinitionMaster.DataItem.BirthDateHolder, "MM/dd/yyyy");
            $scope.dataDefinitionMaster.DataItem.BirthDate = $scope.dataDefinitionMaster.DataItem.BirthDateHolder;
            $interval.cancel(promise);
            promise = undefined;
            LxDialogService.close(dialogId);
        }, 100);
    };

    $scope.validateInput = function (input) {
        if (input == null || input == "")
            return true;
        return false;
    };

    $scope.emailValidation = function (email) {
        return /^[0-9a-zA-Z]+([0-9a-zA-Z]*[-._+])*[0-9a-zA-Z]+@[0-9a-zA-Z]+([-.][0-9a-zA-Z]+)*([0-9a-zA-Z]*[.])[a-zA-Z]{2,6}$/.test(email);
    };

    $scope.initGenderList = function () {
        $scope.genderList = [
                           { Name: 'Male', Value: 'M' },
                           { Name: 'Female', Value: 'F' }
        ];
    };
    $scope.initGenderList();
    $scope.getCivilStatus = function () {
        $http.get('/api/CivilStatus')
        .success(function (data, status) {
            $scope.civilStatusList = angular.copy(data);
        })
    };
    $scope.getCivilStatus();
    $scope.getUserType = function () {
        $http.get('api/UserTypes?length=0&status=1')
        .success(function (data, status) {
            $scope.userTypeList = angular.copy(data);
        })
    };
    $scope.getUserType();

    $scope.loadMaster = function () {
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
            "Header": ['Username', 'Password','Type', 'First Name', 'Middle Name', 'Last Name', 'Status', 'Contact Number', 'Email Address' ,'Gender', 'Height', 'Weight', 'Birthdate', 'Address', 'Civil Status', 'Occupation', 'No'],
            "Keys": ['Username', 'Password', 'Type', 'FirstName', 'MiddleName', 'LastName', 'Status', 'ContactNo', 'EmailAddress', 'Gender', 'Height', 'Weight', 'BirthDate', 'Address', 'CivilStatus', 'Occupation'],
            "Type": ['String-Default', 'Password', 'String', 'String', 'String', 'String', 'Status-Maintenance', 'Number', 'String-Default', 'Gender', 'Number', 'Number', 'Date', 'String', 'String', 'String'],
            "RequiredFields": ['FirstName-First Name'],
            "DataList": $scope.userInformation,
            "CurrentLength": $scope.userInformation.length,
            "APIUrl": ['api/Users?length=',//get
                       '/api/Users' //post, put, delete
            ],
            "DataItem": {},
            "ServerData": [],
            "ViewOnly": false,
            "contextMenu": ['Edit'],
            "contextMenuLabel": ['Edit'],
            "contextMenuLabelImage": ['mdi mdi-table-edit']
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
                    $scope.userInformation = $scope.dataDefinitionMaster.DataList;
                    for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++)
                    {
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
                        $scope.dataDefinitionMaster.DataList[i].CivilStatusId   = $scope.userInformation[i].UserInformations[0].CivilStatusId;
                        $scope.dataDefinitionMaster.DataList[i].Address         = $scope.userInformation[i].UserInformations[0].Address;
                        $scope.dataDefinitionMaster.DataList[i].Occupation      = $scope.userInformation[i].UserInformations[0].Occupation;
                        $scope.dataDefinitionMaster.DataList[i].Status          = $scope.userInformation[i].Status;
                               
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
                    return true;
                case 'PostEditAction':
                    //Format birthdate
                    $scope.dataDefinitionMaster.DataItem.BirthDate = $filter('date')($scope.dataDefinitionMaster.DataItem.BirthDate, 'MM/dd/yyyy');
                    //initialize gender drop down data source
                    if ($scope.dataDefinitionMaster.DataItem.Gender == 'M')
                        $scope.dataDefinitionMaster.DataItem.GenderDesc = { Name: 'Male', Value: 'M' };
                    else
                        $scope.dataDefinitionMaster.DataItem.GenderDesc = { Name: 'Female', Value: 'F' };
                    //initialize civil status drop down data source
                    for (var i = 0; i < $scope.civilStatusList.length; i++)
                    {
                        if ($scope.dataDefinitionMaster.DataItem.CivilStatusId == $scope.civilStatusList[i].Id)
                        {
                            $scope.dataDefinitionMaster.DataItem.CivilStatusHolder = $scope.civilStatusList[i];
                            i = $scope.civilStatusList.length;;
                        }
                    }
                    $scope.dataDefinitionMaster.DataItem.StatusHolder = ($scope.dataDefinitionMaster.DataItem.Status == 1 ? true : false);
                    return true;
                case 'PreUpdate':
                    delete $scope.dataDefinitionMaster.DataItem.Appointments;
                    delete $scope.dataDefinitionMaster.DataItem.Messages;
                    delete $scope.dataDefinitionMaster.DataItem.Messages1;
                    delete $scope.dataDefinitionMaster.DataItem.Notifications;
                    delete $scope.dataDefinitionMaster.DataItem.PatientDentalHistories;
                    delete $scope.dataDefinitionMaster.DataItem.PatientDiagnosisHistoryMasters;
                    delete $scope.dataDefinitionMaster.DataItem.PatientMedicalHistories;

                    $scope.dataDefinitionMaster.DataItem.Gender = $scope.dataDefinitionMaster.DataItem.GenderDesc.Value;
                    $scope.dataDefinitionMaster.DataItem.CivilStatusId = $scope.dataDefinitionMaster.DataItem.CivilStatusHolder.Id;
                    $scope.dataDefinitionMaster.DataItem.CivilStatus = $scope.dataDefinitionMaster.DataItem.CivilStatusHolder.Name
                    $scope.dataDefinitionMaster.DataItem.UserTypeId = $scope.dataDefinitionMaster.DataItem.UserType.Id;
                    $scope.dataDefinitionMaster.DataItem.Type = $scope.dataDefinitionMaster.DataItem.UserType.Name;

                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].FirstName = $scope.dataDefinitionMaster.DataItem.FirstName;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].MiddleName = $scope.dataDefinitionMaster.DataItem.FirstName;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].LastName = $scope.dataDefinitionMaster.DataItem.FirstName;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].Height = $scope.dataDefinitionMaster.DataItem.Height;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].Weight = $scope.dataDefinitionMaster.DataItem.Weight;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].Gender = $scope.dataDefinitionMaster.DataItem.Gender;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].BirthDate = $scope.dataDefinitionMaster.DataItem.BirthDate;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].CivilStatusId = $scope.dataDefinitionMaster.DataItem.CivilStatusId;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].Occupation = $scope.dataDefinitionMaster.DataItem.Occupation;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].Address = $scope.dataDefinitionMaster.DataItem.Address;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].EmailAddress = $scope.dataDefinitionMaster.DataItem.EmailAddress;
                    $scope.dataDefinitionMaster.DataItem.UserInformations[0].ContactNo = $scope.dataDefinitionMaster.DataItem.ContactNo;

                    console.log($scope.dataDefinitionMaster.DataItem);
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
                    $scope.initializeDataDetails();
                    $scope.closeForm();
                    return true;
                default:
                    return true;
            }
        };

        $scope.resetMasterItem = function () {
            $scope.dataDefinitionMaster.DataItem = {
                Id: null,
                Username: null,
                Password: null,
                UserType: null,
                FirstName: null,
                MiddleName: null,
                LastName: null,
                Height: null,
                Weight: null,
                Gender: null,
                BirthDate: null, 
                Occupation: null,
                Address: null,
                EmailAddress: null,
                ContactNo: null,
                Status: null,
                CivilStatusId: null,
                UserTypeId: null,
                UserType: null,
                CivilStatus: null,
                CivilStatusHolder: null,
                StatusHolder: null,
                BirthDateHolder:null,
                GenderDesc: null
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

        $scope.initializeDataDetails = function () {
            for (var i = 0; i < $scope.dataDefinitionMaster.DataList.length; i++) {
                if ($scope.dataDefinitionMaster.DataItem.Id == $scope.dataDefinitionMaster.DataList[i].Id) {
                    $scope.dataDefinitionMaster.DataList[i] = $scope.dataDefinitionMaster.DataItem;
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
        }
        else {
            $scope.checkBoxStyle = "padding-top:40px";
        }
        $scope.statusLabel = ($scope.dataDefinitionMaster.DataItem.StatusHolder == true ? 'Active' : 'Inactive');
        $scope.dataDefinitionMaster.DataItem.Status = ($scope.dataDefinitionMaster.DataItem.StatusHolder == true ? 1 : 0);
    }, 100);
}