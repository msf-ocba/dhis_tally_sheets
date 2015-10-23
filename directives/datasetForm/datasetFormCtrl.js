TallySheets.directive('datasetForm', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/datasetForm/datasetFormView.html',
        scope: {
            datasetId: '=',
            datasetName: '='
        }
    };
});

TallySheets.controller('datasetFormCtrl',['$scope','DataSetEntryForm', function($scope, DataSetEntryForm){

    $scope.formId = "datasetForm" + $scope.datasetId;

    if($scope.datasetId != '0') {
        $scope.progressbarDisplayed = true;
        DataSetEntryForm.get({dataSetId: $scope.datasetId}).$promise.then(function(dataSetHtml){
            var codeHtml = dataSetHtml.codeHtml;

            // Replace unique id='tabs'
            codeHtml = codeHtml.replace(/id="tabs"/g, 'id="tabs-' + $scope.datasetId + '"' );

            $("#" + $scope.formId).children().remove();
            $("#" + $scope.formId).append("<h2><input class='dsTitle' value='" + $scope.datasetName + "'></h2>");
            $("#" + $scope.formId).append(codeHtml);
            formatDataset();
            $scope.progressbarDisplayed = false;
        });
    }

    var formatDataset = function(){
        // Remove section filters
        $(".sectionFilter").parent().replaceWith("<th class='no-border'></th>");

        // Remove categoryoptions headers
        $(".hidden").remove();

        // Replace empty cells in header
        $(".sectionTable tbody th").parent().find("td").replaceWith("<th class='no-border'></th>");

        // Set entryfields as readonly
        $(".entryfield").prop("readonly", true);

        // Modify titles of sections to place them as section header
        var sectionLinks = $("div[id^='tabs-'] > ul > li > a");
        sectionLinks.each( function(){
            var sectionId = $(this).attr("href");
            if (sectionId.startsWith("#")) {sectionId = sectionId.substring(1);}

            $("#" + sectionId).prepend("<h3>" + $(this).html() + "</h3>");
            $(this).parent().remove();
        });

        // Make rows resizable
        $(".sectionTable tr").each( function(){
            $(this).find("td").last().resizable();
        });
        $(".sectionTable input").remove();

        // Add border to section table (for printing in MS Excel)
        $(".sectionTable").prop('border','1');

        // Put section in a panel
        $(".formSection").addClass("panel panel-default");

    };

    var onSampleResized = function (e) {
        var columns = $(e.currentTarget).find("td");
        var rows = $(e.currentTarget).find("tr");
        var Cloumnsize;
        var rowsize;
        columns.each(function () {
            Cloumnsize += $(this).attr('id') + "" + $(this).width() + "" + $(this).height() + ";";
        });
        rows.each(function () {
            rowsize += $(this).attr('id') + "" + $(this).width() + "" + $(this).height() + ";";
        });
        document.getElementById("hf_columndata").value = Cloumnsize;
        document.getElementById("hf_rowdata").value = rowsize;
    };
}]);
