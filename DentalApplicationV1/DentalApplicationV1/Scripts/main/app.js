var dentalApp = angular.module('DentalApp', ['lumx', 'ui.router', 'ngCookies'])
.run(function ($rootScope, $http, $location) {
    $rootScope.browserWidth = true;
    $rootScope.isLogged = false;
    $rootScope.user = null;
    $rootScope.appName = "Smile Fairies Dental Suites";

    //Check if user is already logged
    $http.get("/api/Users/userinfo?userinfo=none&request=CheckIfLogged")
        .success(function (data, status) {
            if (data.status == "SUCCESS") {
                $rootScope.user = data.objParam1[0];
                $rootScope.isLogged = true;
                $location.path("User/Index");
            }
        });
});

dentalApp.config(function ($stateProvider, $urlRouterProvider) {
    //default view in ui-view
    $urlRouterProvider.otherwise("/Home/Index");

    //Home Link
    $stateProvider
    .state('Home', {
        url: "/Home/Index",
        templateUrl: "Home/Templates/Home"
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
        templateUrl: "User/Index"
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
});