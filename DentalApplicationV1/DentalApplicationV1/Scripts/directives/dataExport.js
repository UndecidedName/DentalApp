dentalApp.directive('dirExport', function () {
    return {
        restrict: 'C',
        link: function ($scope, elm, attr) {
            $scope.$on('export-excel', function (e, d) {
                elm.tableExport({ type: 'excel', escape: 'false' });
            });

            $scope.$on('export-doc', function (e, d) {
                elm.tableExport({ type: 'doc', escape: 'false' });
            });

            $scope.$on('export-png', function (e, d) {
                elm.tableExport({ type: 'png', escape: 'false' });
            });

            $scope.$on('export-pdf', function (e, d) {
                elm.tableExport({ type: 'pdf', pdfFontSize:'7',escape: 'false' });
            });

            $scope.$on('export-csv', function (e, d) {
                elm.tableExport({ type: 'csv', escape: 'false' });
            });

            $scope.$on('export-txt', function (e, d) {
                elm.tableExport({ type: 'txt', escape: 'false' });
            });
        }
    }
});