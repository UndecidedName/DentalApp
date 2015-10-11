var dentalApp = angular.module('DentalApp', ['lumx', 'ui.router', 'ngCookies', 'mdDateTime', 'ui.grid', 'ui.grid.autoResize', 'ui.grid.moveColumns', 'ui.grid.resizeColumns', 'ui.grid.selection', 'ui.grid.exporter'])
.run(function ($rootScope, $http, $location, LxNotificationService, $interval) {
    $rootScope.reset = function () {
        $rootScope.browserWidth = true;
        $rootScope.isLogged = false;
        $rootScope.user = null;
        $rootScope.appName = "Smile Fairies Dental Suites";
        $rootScope.notificationList = [];
        $rootScope.usersForNotification = [];
        $rootScope.notifCount = 0;
    }
    $rootScope.reset();
    $rootScope.notification = null;

    $rootScope.removeSuperAdmin = function (container) {
        //Remove SuperAdmin User if Logged user is not the super admin
        if ($rootScope.user.UserTypeId != 1) {
            for (var i = 0; i < container.length; i++) {
                if (container[i].Id == 1) {
                    container.splice(i, 1);
                    i = container.length;
                }
            }
            return container;
        }
        return container;
    };

    //NotificationHub Instance
    $rootScope.notification = $.connection.notificationHub;

    //Check if user is already logged
    $http.get("/api/Users/userinfo?userinfo=none&request=CheckIfLogged")
    .success(function (data, status) {
        if (data.status == "SUCCESS") {
            $rootScope.user = data.objParam1[0];
            $rootScope.isLogged = true;

            //get all users which are userType 4 for Dentist and 5 for Secretary
            $rootScope.usersForNotification = data.objParam2;

            //Start the connection
            $.connection.hub.start().done(function () {
                $rootScope.addClient($rootScope.user.Id.toString(), $.connection.hub.id);
            });

            //Get unread notification count
            $http.get("api/Notifications?status=0&userId=" + $rootScope.user.Id + "&dummy=''")
            .success(function (data, status) {
                if (data.status == "SUCCESS") {
                    $rootScope.notifCount = data.intParam1;
                }
            });

            $location.path("User/Index");
        }
        else
            LxNotificationService.success('Welcome to ' + $rootScope.appName + '!');

    });

    //function that will be called in broadcasting the notification to a client
    $rootScope.notification.client.broadcastNotification = function (notification) {
        $rootScope.notificationList.push(notification);
        var snd = undefined;
        var snd = new Audio("/audio/notification.mp3"); // buffers automatically when created
        $rootScope.notifCount += 1;
        snd.play();
    };

    //Start the connection
    $.connection.hub.start().done(function () {
        //function that add the client to the clientDictionary
        $rootScope.addClient = function (clientName, clientId) {
            $rootScope.notification.server.addClient(clientName, clientId);
        }
        //function that send notification to a specific client registered in clientDictionary
        $rootScope.sendNotification = function (notification, clientName) {
            //Save notification
            $http.post("/api/Notifications", notification)
            .success(function (data, status) {
                if (data.status == "SUCCESS")
                    //send the notification to server for broadcasting
                    $rootScope.notification.server.sendToClient(data.objParam1, clientName);
            })
        }
    });

    //Manipulate DOM for removing an element
    $rootScope.manipulateDOM = function () {
        Element.prototype.remove = function () {
            this.parentElement.removeChild(this);
        }
        NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
            for (var i = this.length - 1; i >= 0; i--) {
                if (this[i] && this[i].parentElement) {
                    this[i].parentElement.removeChild(this[i]);
                }
            }
        }
    };
});

dentalApp.config(function ($stateProvider, $urlRouterProvider) {
    //default view in ui-view
    $urlRouterProvider.otherwise("/");

    //Home Link
    $stateProvider
    .state('Home', {
        url: "/Home/Index",
        templateUrl: "Home/Templates/Home",
        controller: "IndexController"
    })

    //AboutUs Link
    .state('AboutUs', {
        url: "/Home/Index",
        templateUrl: "Home/Templates/AboutUs"
    })

    //Testimonial Link
    .state('Testimonials', {
        url: "/Home/Index",
        templateUrl: "Home/Templates/Testimonials"
    })

    //Contact Us Link
    .state('ContactUs', {
        url: "/Home/Index",
        templateUrl: "Home/Templates/ContactUs"
    })

     //OurServices Link
    .state('OurServices', {
        url: "/Home/Index",
        templateUrl: "Home/Templates/OurServices"
    })

    .state('Profile', {
        url: "/User/Index",
        templateUrl: "User/Index",
        controller: "UserIndexController"
    })

    .state('Notification', {
        url: "/User/Index",
        templateUrl: "User/Templates/Notification",
        controller: "NotificationController"
    })

    .state('Setting', {
        url: "/User/Index",
        templateUrl: "User/Templates/Setting",
        controller: "SettingController"
    })

    .state('Appointment', {
        url: "/User/Index",
        templateUrl: "User/Templates/Appointment",
        controller: "AppointmentController"
    })
    
    .state('Schedule', {
        url: "/User/Index",
        templateUrl: "User/Templates/Schedule",
        controller: "ScheduleController"
    })
    .state('AppointmentApproval', {
        url: "/User/Index",
        templateUrl: "User/Templates/AppointmentApproval",
        controller: "AppointmentApprovalController"
    })
    .state('Menu', {
        url: "/User/Index",
        templateUrl: "User/Templates/Menu",
        controller: "MenuController"
    })
    .state('CivilStatus', {
        url: "/User/Index",
        templateUrl: "User/Templates/CivilStatus",
        controller: "CivilStatusController"
    })
    .state('UserInformation', {
        url: "/User/Index",
        templateUrl: "User/Templates/UserInformation",
        controller: "UserInformationController"
    })
    .state('UserMenu', {
         url: "/User/Index",
         templateUrl: "User/Templates/UserMenu",
         controller: "UserMenuController"
    })
    .state('UserType', {
        url: "/User/Index",
        templateUrl: "User/Templates/UserType",
        controller: "UserTypeController"
    })
    .state('TreatmentType', {
        url: "/User/Index",
        templateUrl: "User/Templates/TreatmentType",
        controller: "TreatmentTypeController"
    })
    .state('SpecialAppointments', {
        url: "/User/Index",
        templateUrl: "User/Templates/SpecialAppointments",
        controller: "SpecialAppointmentsController"
    })
    .state('PDH', {
        url: "/User/Index",
        templateUrl: "User/Templates/PDH",
        controller: "PDHController"
    })
    .state('AppointmentReport1', {
        url: "/User/Index",
        templateUrl: "User/Templates/AppointmentReport1",
        controller: "AppointmentReport1Controller"
    })
    
});