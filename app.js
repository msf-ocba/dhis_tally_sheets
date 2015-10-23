
var TallySheets = angular.module('TallySheets', ['ngResource', 'pascalprecht.translate']);

var dhisUrl = $.parseJSON( $.ajax({
	type: "GET",
	dataType: "json",
	url: 'manifest.webapp',
	async: false
}).responseText).activities.dhis.href.replace( '/dhis-web-maintenance-appmanager', '' );

var ApiUrl = dhisUrl + '/api';

TallySheets.controller('TallySheetsController', [ "$scope", "DataSetsUID", "DataSetEntryForm", function($scope, DataSetsUID, DataSetEntryForm){

	var dsSelectorLastId = -1;
	$scope.dsSelectorList = [];

	$scope.addDatasetSelector = function(){
		dsSelectorLastId++;
		$scope.dsSelectorList.push({id: dsSelectorLastId, dataset:{}});
	}

	$scope.deleteDatesetSelector = function(selectPosition){
		$scope.dsSelectorList.splice(selectPosition, 1);
	}

	$scope.exportToTable = function(table, name) {
		var uri = 'data:application/vnd.ms-excel;base64,'
			, template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
			, base64 = function (s) {
				return window.btoa(unescape(encodeURIComponent(s)))
			}
			, format = function (s, c) {
				return s.replace(/{(\w+)}/g, function (m, p) {
					return c[p];
				})
			}

		if (!table.nodeType) table = document.getElementById(table)
		var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
		window.location.href = uri + base64(format(template, ctx))
	}
	
	$scope.goHome = function(){
	  	window.location.replace(dhisUrl);
	};

}]);

TallySheets.factory("DataSetsUID",['$resource', function ($resource) {
	return $resource( ApiUrl + "/dataSets.json?fields=id,displayName&paging=false&translate=true", 
		{},
		{ get: { method: "GET"} });
}]);

TallySheets.factory("DataSetEntryForm",['$resource', function ($resource) {
	return $resource( dhisUrl + "/dhis-web-dataentry/loadForm.action", 
		{ dataSetId:'@dataSetId' },
		{ get: { method: "GET", transformResponse: function (response) {
			return {codeHtml: response};}
		}
	});
}]);

TallySheets.directive('onFinishRender', function ($timeout) {
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

TallySheets.directive('d2Progressbar', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/progressBar/progressBar.html'
	};
}); 

TallySheets.config(function ($translateProvider) {
	  
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