dentalApp.directive('dirDataGridReport', function () {
    /*---------------------------------------------------------------------------------//
     Directive Name: dirDataGrid1
     Author: Kenneth Ybañez
     Note: If this is used more than once in a page, the other instance should be resetted.
     Functionalities:
     1. CRUD
     2. Pagination
     3. Sorting
     4. Context-Menu
     5. Overriding and Overloading by using otherActions scope predefined actions
     6. Formatting of Date,Time,DateTime, String, String-Upper, Boolean and Number
     7. Validate required fields
     8. Export data to excel, word, png
    ---------------------------------------------------------------------------------*/
    return {
        restrict: 'E',
        scope: {
            datadefinition: '=',
            scrolled: '=' //listen if ui-grid was scrolled in it's max height
        },
        templateUrl: '/Directive/DataGridReport',
        controller: function ($filter, $scope, $http, $interval, $parse, $compile) {
            $scope.gridOptions = {};

            //Set the focus on top of the page during load
            $scope.focusOnTop = function () {
                $(document).ready(function () {
                    $(this).scrollTop(0);
                });
            };

            //Initialize ui-grid options
            $scope.initGridOptions = function () {
                var columns = [];
                //Initialize Number Listing
                var columnProperties = {};
                columnProperties.name = $scope.datadefinition.Header[$scope.datadefinition.Header.length - 1];
                columnProperties.field = 'No';
                columnProperties.cellTemplate = '<div class="ui-grid-cell-contents text-center">{{grid.renderContainers.body.visibleRowCache.indexOf(row) + 1}}</div>';
                columnProperties.width = 45;
                columnProperties.enableColumnResizing = true;
                columnProperties.enableColumnMenu = false;
                columnProperties.enableColumnMoving = false;
                columns.push(columnProperties);
                //Initialize column data
                for (var i = 0; i < ($scope.datadefinition.Header.length - 1) ; i++) {
                    var columnProperties = {};
                    columnProperties.name = $scope.datadefinition.Header[i];
                    columnProperties.field = $scope.datadefinition.Keys[i];
                    columnProperties.width = $scope.datadefinition.ColWidth[i];
                    //format field value
                    columnProperties.cellFilter = $scope.datadefinition.Type[i];
                    columns.push(columnProperties);
                }

                $scope.gridOptions = {
                    columnDefs: columns,
                    rowTemplate: '<div>' +
                        ' <div  ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell"  ui-grid-cell ng-click="grid.appScope.setSelected(row.entity.Id)"  context-menu="grid.appScope.setSelected(row.entity.Id)" data-target= "{{grid.appScope.datadefinition.DataTarget}}"></div>' +
                      '</div>',
                    //enableVerticalScrollbar: 0,
                    //enableHorizontalScrollbar: 2,
                    enableColumnResizing: true,
                    enableGridMenu: true,
                    enableSelectAll: true,
                    exporterCsvFilename: 'myFile.csv',
                    exporterPdfDefaultStyle: { fontSize: 9 },
                    exporterPdfTableStyle: { margin: [0, 0, 0, 0] },
                    exporterPdfTableHeaderStyle: { fontSize: 12, bold: true, italics: true, color: 'black' },
                    exporterPdfHeader: { text: "Fast Cargo", style: 'headerStyle' },
                    exporterPdfFooter: function (currentPage, pageCount) {
                        return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
                    },
                    exporterPdfCustomFormatter: function (docDefinition) {
                        docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
                        docDefinition.styles.footerStyle = { fontSize: 22, bold: true };
                        return docDefinition;
                    },
                    exporterPdfOrientation: 'landscape',
                    exporterPdfPageSize: 'a4',
                    exporterPdfMaxGridWidth: 500,
                    exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                    }
                };
            };

            //Function that binds ui-grid template during scroll
            $scope.onScroll = function () {
                if ($scope.datadefinition.EnableScroll == true)
                    $scope.scrolled = true;
                else
                    $scope.scrolled = false;
            };

            $interval(function () {
                $scope.gridOptions.data = $scope.datadefinition.DataList;
            }, 100);

            var init = function () {
                $scope.initGridOptions();
            };

            init();
        }
    }
});
