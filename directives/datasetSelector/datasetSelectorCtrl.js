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

    $(document).on("change", "#" + $scope.id, function () {
      var dsId = $("option:selected", this).val();
      var dsName = $("option:selected", this).html().trim();

      $scope.bindToDataset.id = dsId;
      console.log(dsId);
      console.log(dsName);
      $scope.bindToDataset.name = dsName;

      $rootScope.$apply();
    });
  },
]);
