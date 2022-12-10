TallySheets.directive("datasetForm", function () {
  return {
    restrict: "E",
    templateUrl: "directives/datasetForm/datasetFormView.html",
    scope: {
      dataset: "=",
      selectorId: "@",
    },
  };
});

TallySheets.controller("datasetFormCtrl", [
  "$scope",
  "DataSetEntryForm",
  function ($scope, DataSetEntryForm) {
    $scope.headers = true;

    var header = $scope.headers
      ? "<span><h3><input type='text' class='dsTitle' value='Health Facility:'></h3><h3><input type= 'text' class='dsTitle' value='Reporting Period:'></h3></span>"
      : "";

    $scope.$watch(
      function () {
        return $scope.dataset.selected;
      },
      function (newVal, oldVal, scope) {
        $scope.progressbarDisplayed = true;

        DataSetEntryForm.get({ dataSetId: scope.dataset.id }).$promise.then(
          function (dataSetHtml) {
            var codeHtml = dataSetHtml.codeHtml;

            // Replace unique id='tabs'
            codeHtml = codeHtml.replace(
              /id="tabs"/g,
              'id="tabs-' + scope.dataset.id + '"'
            );

            $("#datasetForms").prepend(
              "<span id=datasetForm" +
                $scope.selectorId +
                ">" +
                header +
                "<h2><input id='title' class='dsTitle' value=''></h2>" +
                codeHtml +
                "</span>"
            );

            document.getElementById("title").defaultValue = scope.dataset.name;

            $scope.progressbarDisplayed = false;
            formatDataset();
          }
        );
        $scope.selectorId++;
      }
    );

    var updateForm = function (datasetId, datasetName) {
      // Delete previous dataset, if any
      $("#" + $scope.formId)
        .children()
        .remove();

      // Assign a new id (for new dataset)
      $scope.formId = "datasetForm" + $scope.selectorId;

      if (datasetId != "0") {
        $scope.progressbarDisplayed = true;
        DataSetEntryForm.get({ dataSetId: datasetId }).$promise.then(function (
          dataSetHtml
        ) {
          var codeHtml = dataSetHtml.codeHtml;

          // Replace unique id='tabs'
          codeHtml = codeHtml.replace(
            /id="tabs"/g,
            'id="tabs-' + datasetId + '"'
          );

          $("#" + $scope.formId).append(
            "<h2><input class='dsTitle' value='" + datasetName + "'></h2>"
          );
          $("#" + $scope.formId).append(codeHtml);

          formatDataset();
          $scope.progressbarDisplayed = false;
        });
      }
    };

    var formatDataset = function () {
      var datasetForm = $("#datasetForm" + $scope.selectorId);
      // Remove section filters
      datasetForm
        .find(".sectionFilter")
        .parent()
        .replaceWith("<th class='no-border'></th>");

      // Remove categoryoptions headers
      datasetForm.find(".hidden").remove();

      datasetForm.find(".indicatorArea").remove();

      // Replace empty cells in header
      datasetForm
        .find(".sectionTable tbody th")
        .parent()
        .find("td")
        .replaceWith("<th class='no-border'></th>");

      // Set entryfields as readonly
      datasetForm.find(".entryfield").prop("readonly", true);

      // Remove total columns
      var headerSections = datasetForm.find(".sectionTable thead");
      headerSections.each(function () {
        var firstHeaders = $(this).find("tr").first().find("th");
        if (firstHeaders.length > 4) {
          // Elimina la ultima columna de las tablas si hay mas de 4
          //firstHeaders.last().remove();
        }
      });

      var bodyRows = datasetForm.find(".sectionTable tbody tr");
      bodyRows.each(function () {
        var rows = $(this).find("td");
        if (rows.length > 4) {
          // Elimina la ultima columna de las tablas si hay mas de 4
          //  rows.last().remove();
        }
        // console.log(rows);
        // console.log("total");
        // console.log(rows.indexOf("Total"));
      });

      // Modify titles of sections to place them as section header
      var sectionLinks = datasetForm.find("div[id^='tabs-'] > ul > li > a");
      sectionLinks.each(function () {
        var sectionId = $(this).attr("href");
        if (sectionId.startsWith("#")) {
          sectionId = sectionId.substring(1);
        }

        // Add a Section Header at the beginning of the table
        // Also, if the dataset has sections, add a 'delete' button to allow removing the section
        datasetForm
          .find("#" + sectionId)
          .prepend(
            "<h3>" +
              "<button class='remove-section btn btn-default btn-sm hidden-print' sectionId=" +
              sectionId +
              ">" +
              "<span class='glyphicon glyphicon-remove'></span></button>  " +
              $(this).html() +
              "</h3>"
          );
        $(this).parent().remove();
      });

      // Remove "Total" rows
      datasetForm
        .find(".sectionTable tr td:contains('Total')")
        .parent("tr")
        .remove();

      // Remove "Total" columns
      var headerSections = datasetForm.find(".sectionTable thead");
      var tableWithTotal = datasetForm
        .find(".sectionTable thead tr")
        .find("th:contains('Total')")
        .parent()
        .parent()
        .parent();
      tableWithTotal.find("tbody tr").each(function () {
        var rows = $(this).find("td");
        if (headerSections.find("tr").find("th:contains('Total')")[0]) {
          rows.last().remove();
        }
      });
      headerSections.find("tr").find("th:contains('Total')").remove();

      /*
             // Remove "Comments" section
             datasetForm.find( ".formSection:contains('Comments'), " +
             ".formSection:contains('Comentarios'), " +
             ".formSection:contains('Commentaires'), " +
             ".formSection:contains('Comentários'), " +
             ".formSection:contains('Notas')" )
             .parent("div").remove();
*/

      $("h3")
        .filter(function () {
          return (
            this.innerHTML.indexOf("Comments") > -1 ||
            this.innerHTML.indexOf("Comentarios") > -1 ||
            this.innerHTML.indexOf("Commentaires") > -1 ||
            this.innerHTML.indexOf("Comentários") > -1 ||
            this.innerHTML.indexOf("Notas") > -1
          );
        })
        .parent("div")
        .remove();

      // Make rows resizable
      datasetForm.find(".sectionTable tr").each(function () {
        $(this).find("td").last().resizable();
      });

      // Add class "greyfield" to cells (td object)
      datasetForm
        .find(".sectionTable input:disabled")
        .closest("td")
        .addClass("greyfield");

      // Delete commentlinks for Watsan
      datasetForm.find(".commentlink").remove();

      // Delete entryfields
      datasetForm.find(".sectionTable input").remove();

      // Write an "X" in greyfields to represent that they are blocked
      datasetForm.find(".sectionTable td.greyfield").html("X");

      // Put section in a panel
      datasetForm.find(".formSection").addClass("panel panel-default");

      // Add listeners
      datasetForm.on("click", ".remove-section", function (event) {
        var sectionId = $(this).attr("sectionId");
        datasetForm.find("#" + sectionId).hide(400, function () {
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
        Cloumnsize +=
          $(this).attr("id") +
          "" +
          $(this).width() +
          "" +
          $(this).height() +
          ";";
      });
      rows.each(function () {
        rowsize +=
          $(this).attr("id") +
          "" +
          $(this).width() +
          "" +
          $(this).height() +
          ";";
      });
      document.getElementById("hf_columndata").value = Cloumnsize;
      document.getElementById("hf_rowdata").value = rowsize;
    };
  },
]);
