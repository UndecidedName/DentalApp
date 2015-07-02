var dentalApp = angular.module('DentalApp', ['lumx', 'ui.router'])
.run(function ($rootScope, $http) {
    $rootScope.browserWidth = true;
    $rootScope.isLogged = false;
    $rootScope.username = null;
    $rootScope.sideBarCompiled = false;
    $rootScope.appName = "Smile Fairies Dental Suites";
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