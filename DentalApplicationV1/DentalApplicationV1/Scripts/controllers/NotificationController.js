dentalApp.controller('NotificationController', NotificationController);
function NotificationController(LxDialogService, LxNotificationService, LxDropdownService, $scope, $rootScope, $filter) {
    $rootScope.notification.server.send("test", "test");
    $rootScope.sendNotification($filter('date')(new Date(), "MM/dd/yyyy"), "Test Notification", "Dentist1");
};