TallySheets.directive("datasetSelector", function () {
  return {
    restrict: "E",
    templateUrl: "directives/datasetSelector/datasetSelectorView.html",
    scope: {
      selectorId: "=",
      bindToDataset: "=",
    },
  };
});

TallySheets.controller("datasetSelectorCtrl", [
  "$scope",
  "$rootScope",
  "DataSetsUID",
  function ($scope, $rootScope, DataSetsUID) {
    $scope.id = "dsSelector" + $scope.selectorId;

    $scope.selectorLoaded = false;
    DataSetsUID.get().$promise.then(function (result) {
      $scope.dataSetList = result.dataSets.filter((ds) => {
        var visible = true;

        $scope.languages = ds.translations.filter(
          (translation) => translation.property === "NAME"
        );

        for (att in ds.attributeValues) {
          if (
            ds.attributeValues[att].value == "true" &&
            ds.attributeValues[att].attribute.id == "Re2UlY7OGO4"
          ) {
            visible = false;
          }
        }
        return visible;
      });
    });

    $scope.$on("ngRepeatFinished", function (ngRepeatFinishedEvent) {
      // Refresh bootstrap-select
      $(".selectpicker").selectpicker("refresh");
      $(".selectpicker").selectpicker("render");
      $scope.selectorLoaded = true;
    });

    var form = document.querySelector("#datasetSelector");

    $(form).on("change", "#" + $scope.id, function () {
      var formData = new FormData(form);
      var selectedValues = formData.getAll("dataset");

      var dsId = selectedValues[selectedValues.length - 1];
      var dsName = $scope.dataSetList.find(
        (dataSet) => dataSet.id === dsId
      ).displayName;

      $scope.bindToDataset.id = dsId;
      $scope.bindToDataset.name = dsName;
      $scope.bindToDataset.selectedIds = selectedValues;
      $scope.bindToDataset.dataSets = $scope.dataSetList;

      $rootScope.$apply();
    });
  },
]);
