
var tallySheets = angular.module('TallySheets', ['ngResource', 'pascalprecht.translate']);

var dhisUrl = $.parseJSON( $.ajax({
	type: "GET",
	dataType: "json",
	url: 'manifest.webapp',
	async: false
}).responseText).activities.dhis.href.replace( '/dhis-web-maintenance-appmanager', '' );

var ApiUrl = dhisUrl + '/api';

tallySheets.controller('TallySheetsController', [ "$scope", "DataSetsUID", "DataSetEntryForm", function($scope, DataSetsUID, DataSetEntryForm){
	
	DataSetsUID.get().$promise.then(function(result){
		$scope.dataSetList = result.dataSets;
	});
	
	var showDataSet = function(dsId, dsName){
		
		if(dsId != '0') {
			$scope.progressbarDisplayed = true;
			DataSetEntryForm.get({dataSetId: dsId}).$promise.then(function(dataSetHtml){
				var codeHtml = dataSetHtml.codeHtml;
				
				// Replace unique id='tabs'
				codeHtml = codeHtml.replace(/id="tabs"/g, 'id="tabs-' + dsId + '"' );
				
				$("#datasetform").children().remove();
				$("#datasetform").append("<h2><input id='dsTitle' value='" + dsName + "'></h2>");
				$("#datasetform").append(codeHtml);			
				$scope.formatDatasets();
				$scope.progressbarDisplayed = false;
			});
		}
		
	}
	
	$scope.formatDatasets = function(){
		// Remove section filters
		$(".sectionFilter").parent().replaceWith("<th class='no-border'></th>");
		
		// Replace empty cells in header
		$(".sectionTable tbody th").parent().find("td").replaceWith("<th class='no-border'></th>");
				
		// Set entryfields as readonly
		$(".entryfield").prop("readonly", true);
		
		// Set some layout to tables
		//$(".sectionTable").addClass("table table-condensed table-bordered table-striped");
		
		// Modify titles of sections to place them as section header
		var sectionLinks = $("div[id^='tabs-'] > ul > li > a");
		sectionLinks.each( function(){
			var sectionId = $(this).attr("href");
			if (sectionId.startsWith("#")) {sectionId = sectionId.substring(1);}
			
			$("#" + sectionId).prepend("<h3>" + $(this).html() + "</h3>");
			$(this).parent().remove();
		});
		
		$(".sectionTable tr").each( function(){
			$(this).find("td").last().resizable();
		});
		$(".sectionTable input").remove();
		
		// Put section in a panel
		$(".formSection").addClass("panel panel-default");
		
	};
	
	$scope.goHome = function(){
	  	window.location.replace(dhisUrl);
	};
	
	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		// Refresh bootstrap-select
		$('.selectpicker').selectpicker('refresh');
		$('.selectpicker').selectpicker('render');
	});
	
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
           
	$("#dataSetSelector").change(function(){
		var dsId = $("#dataSetSelector option:selected").val();
		var dsName = $("#dataSetSelector option:selected").html().trim();
		
		showDataSet(dsId, dsName);
	});
	
}]);

tallySheets.factory("DataSetsUID",['$resource', function ($resource) {
	return $resource( ApiUrl + "/dataSets.json?fields=id,displayName&paging=false&translate=true", 
		{},
		{ get: { method: "GET"} });
}]);

tallySheets.factory("DataSetEntryForm",['$resource', function ($resource) {
	return $resource( dhisUrl + "/dhis-web-dataentry/loadForm.action", 
		{ dataSetId:'@dataSetId' },
		{ get: { method: "GET", transformResponse: function (response) {
			return {codeHtml: response};}
		}
	});
}]);

tallySheets.directive('onFinishRender', function ($timeout) {
return {
    restrict: 'A',
    link: function (scope, element, attr) {
        if (scope.$last === true) {
            $timeout(function () {
                scope.$emit('ngRepeatFinished');
            });
        }
    }
}});

tallySheets.directive('d2Progressbar', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/progressBar/progressBar.html'
	};
}); 

tallySheets.config(function ($translateProvider) {
	  
	  $translateProvider.useStaticFilesLoader({
        prefix: 'languages/',
        suffix: '.json'
    });
	  
	  $translateProvider.registerAvailableLanguageKeys(
			    ['es', 'fr', 'en'],
			    {
			        'en*': 'en',
			        'es*': 'es',
					'fr*': 'fr',
			        '*': 'en' // must be last!
			    }
			);
	  
	  $translateProvider.fallbackLanguage(['en']);

	  jQuery.ajax({ url: ApiUrl + '/userSettings/keyUiLocale/', contentType: 'text/plain', method: 'GET', dataType: 'text', async: false}).success(function (uiLocale) {
		  if (uiLocale == ''){
			  $translateProvider.determinePreferredLanguage();
		  }
		  else{
			  $translateProvider.use(uiLocale);
		  }
    }).fail(function () {
  	  $translateProvider.determinePreferredLanguage();
	  });
	  
});