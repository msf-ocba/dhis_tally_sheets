TallySheets.directive('datasetForm', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/datasetForm/datasetFormView.html',
        scope: {
            dataset: '=',
            selectorId: '@'
        }
    };
});

TallySheets.controller('datasetFormCtrl',['$scope','DataSetEntryForm', function($scope, DataSetEntryForm){

    $scope.$watch(function(){ return $scope.dataset.id}, function(newVal, oldVal, scope){
        updateForm(scope.dataset.id, scope.dataset.name);
    });

    var updateForm = function(datasetId, datasetName){

        //Delete previous dataset, if any
        $("#" + $scope.formId).children().remove();

        // Assign a new id (for new dataset)
        $scope.formId = "datasetForm" + $scope.selectorId;

        if(datasetId != '0') {
            $scope.progressbarDisplayed = true;
            DataSetEntryForm.get({dataSetId: datasetId}).$promise.then(function(dataSetHtml){
                var codeHtml = dataSetHtml.codeHtml;

                // Replace unique id='tabs'
                codeHtml = codeHtml.replace(/id="tabs"/g, 'id="tabs-' + datasetId + '"' );

                $("#" + $scope.formId).append("<h2><input class='dsTitle' value='" + datasetName + "'></h2>");
                $("#" + $scope.formId).append(codeHtml);
                formatDataset();
                $scope.progressbarDisplayed = false;
            });
        }
    }

    var formatDataset = function(){

        var datasetForm = $("#" + $scope.formId);
        // Remove section filters
        datasetForm.find(".sectionFilter").parent().replaceWith("<th class='no-border'></th>");

        // Remove categoryoptions headers
        datasetForm.find(".hidden").remove();

        // Replace empty cells in header
        datasetForm.find(".sectionTable tbody th").parent().find("td").replaceWith("<th class='no-border'></th>");

        // Set entryfields as readonly
        datasetForm.find(".entryfield").prop("readonly", true);

        // Modify titles of sections to place them as section header
        var sectionLinks = datasetForm.find("div[id^='tabs-'] > ul > li > a");
        sectionLinks.each( function(){
            var sectionId = $(this).attr("href");
            if (sectionId.startsWith("#")) {sectionId = sectionId.substring(1);}

            // Add a Section Header at the beginning of the table
            // Also, if the dataset has sections, add a 'delete' button to allow removing the section
            datasetForm.find("#" + sectionId).prepend("<h3>" +
                "<button class='remove-section btn btn-default btn-sm hidden-print' sectionId=" + sectionId + ">" +
                "<span class='glyphicon glyphicon-remove'></span></button>  " +
                $(this).html() +
                "</h3>");
            $(this).parent().remove();
        });

        // Make rows resizable
        datasetForm.find(".sectionTable tr").each( function(){
            $(this).find("td").last().resizable();
        });

        // Add class "greyfield" to cells (td object)
        datasetForm.find(".sectionTable input:disabled").closest("td").addClass("greyfield");

        // Delete entryfields
        datasetForm.find(".sectionTable input").remove();

        // Write an "X" in greyfields to represent that they are blocked
        datasetForm.find(".sectionTable td.greyfield").html("X");

        // Put section in a panel
        datasetForm.find(".formSection").addClass("panel panel-default");

        // Add listeners
        datasetForm.on('click', '.remove-section', function(event){
            var sectionId = $(this).attr('sectionId');
            datasetForm.find("#" + sectionId).hide(400, function(){
                datasetForm.find("#" + sectionId).remove();
            });
        });
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
