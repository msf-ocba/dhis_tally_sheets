var TallySheets = angular.module("TallySheets", [
  "ngResource",
  "pascalprecht.translate",
]);

var dhisUrl = window.location.href.split("api/apps/")[0];
var ApiUrl = dhisUrl + "api";

TallySheets.controller("TallySheetsController", [
  "$scope",
  "$rootScope",
  "Headers",
  function ($scope, Headers) {
    var dsSelectorLastId = -1;
    $scope.dsSelectorList = [];

    // Set "headers" to true by default
    $scope.headers = true;
    //Headers.setHeaderValue($scope.headers);

    $scope.addDatasetSelector = function () {
      dsSelectorLastId++;
      $scope.dsSelectorList.push({ id: dsSelectorLastId, dataset: {} });
    };

    $scope.deleteDatesetSelector = function (selectPosition) {
      $scope.dsSelectorList.splice(selectPosition, 1);
    };

    $scope.exportToTable = function (tableId) {
      var uri = "data:application/vnd.ms-excel;base64,",
        template =
          '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
          'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">' +
          "<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}" +
          "</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>" +
          "</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>",
        base64 = function (s) {
          return window.btoa(unescape(encodeURIComponent(s)));
        },
        format = function (s, c) {
          return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
          });
        };

      var table = $("#" + tableId).clone();

      // Remove non-printable section from the table
      table.find(".hidden-print").remove();
      table.find(".ng-hide").remove();

      // Replace input fields with their values (for correct excel formatting)
      table.find("input").each(function () {
        var value = $(this).val();
        $(this).replaceWith(value);
      });

      // Add border to section table (for printing in MS Excel)
      table.find(".sectionTable").prop("border", "1");

      // Take the name of the first dataset as filename
      var name = table.find("h2").first().html() + ".xls";

      var ctx = {
        worksheet: "MSF-OCBA HMIS" || "Worksheet",
        table: table.html(),
      };

      // Create a fake link to download the file
      var link = angular.element('<a class="hidden" id="idlink"></a>');
      link.attr({
        href: uri + base64(format(template, ctx)),
        target: "_blank",
        download: name,
      });
      $("body").prepend(link[0].outerHTML);
      $("#idlink")[0].click();
      $("#idlink")[0].remove();
    };

    $scope.goHome = function () {
      window.location.replace(dhisUrl);
    };

    // Initialize the app with one dataset selector
    $scope.addDatasetSelector();
  },
]);

TallySheets.factory("DataSetsUID", [
  "$resource",
  function ($resource) {
    return $resource(
      ApiUrl + "/dataSets.json",
      {},
      {
        get: {
          method: "GET",
          params: {
            fields:
              "id,displayName,translations,attributeValues[value,attribute]",
            translate: "true",
            paging: false,
          },
        },
      }
    );
  },
]);

TallySheets.factory("DataSetEntryForm", [
  "$resource",
  function ($resource) {
    return $resource(
      dhisUrl + "dhis-web-dataentry/loadForm.action",
      { dataSetId: "@dataSetId" },
      {
        get: {
          method: "GET",
          transformResponse: function (response) {
            return { codeHtml: response };
          },
        },
      }
    );
  },
]);

TallySheets.factory("Headers", function () {
  var data = {};

  return {
    getHeaderValue: function () {
      return data;
    },
    setHeaderValue: function (header) {
      data = header;
    },
  };
});

TallySheets.directive("onFinishRender", function ($timeout) {
  return {
    restrict: "A",
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit("ngRepeatFinished");
        });
      }
    },
  };
});

TallySheets.directive("d2Progressbar", function () {
  return {
    restrict: "E",
    templateUrl: "directives/progressBar/progressBar.html",
  };
});

TallySheets.config(function ($translateProvider) {
  $translateProvider.useStaticFilesLoader({
    prefix: "languages/",
    suffix: ".json",
  });

  $translateProvider.registerAvailableLanguageKeys(["es", "fr", "en", "pt"], {
    "en*": "en",
    "es*": "es",
    "fr*": "fr",
    "pt*": "pt",
    "*": "en", // must be last!
  });

  $translateProvider.fallbackLanguage(["en"]);

  jQuery
    .ajax({
      url: ApiUrl + "/userSettings/keyUiLocale/",
      contentType: "text/plain",
      method: "GET",
      dataType: "text",
      async: false,
    })
    .success(function (uiLocale) {
      if (uiLocale == "") {
        $translateProvider.determinePreferredLanguage();
      } else {
        $translateProvider.use(uiLocale);
      }
    })
    .fail(function () {
      $translateProvider.determinePreferredLanguage();
    });
});
