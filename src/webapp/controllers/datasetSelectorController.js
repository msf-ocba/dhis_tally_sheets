import { TallySheets } from "../TallySheets.js";

export const datasetSelectorController = TallySheets.controller(
	"datasetSelectorCtrl",
	[
		"$scope",
		"$rootScope",
		"DataSetsUID",
		"Locales",
		function ($scope, $rootScope, DataSetsUID, Locales) {
			$scope.id = "dsSelector" + $scope.selectorId;

			$scope.selectorLoaded = false;

			Locales.get().$promise.then(function (result) {
				$scope.languages = result;
			});

			DataSetsUID.get().$promise.then(function (result) {
				$scope.dataSetList = result.dataSets.filter((ds) => {
					var visible = true;

					for (att in ds.attributeValues) {
						if (
							ds.attributeValues[att].value == "true" &&
							ds.attributeValues[att].attribute.id ==
								"Re2UlY7OGO4"
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
			$scope.selectedIds = [];

			$(form).on("change", "#" + $scope.id, function () {
				var formData = new FormData(form);
				var selectedValues = formData.getAll("dataset");

				var dsId = selectedValues.find(
					(selected) => !$scope.selectedIds.includes(selected)
				);
				var dsName = $scope.dataSetList.find(
					(dataSet) => dataSet.id === dsId
				).displayName;

				var languageList = $scope.dataSetList
					.find((dataSet) => dataSet.id === dsId)
					.translations.filter(
						(translation) => translation.property === "NAME"
					);

				$scope.languageList = $scope.languages.filter((lang) =>
					languageList?.some(
						(language) =>
							language.locale.split("_")[0] === lang.locale
					)
				);

				$scope.bindToDataset.id = dsId;
				$scope.bindToDataset.name = dsName;
				$scope.bindToDataset.selectedIds = selectedValues;
				$scope.bindToDataset.dataSets = $scope.dataSetList;

				$scope.selectedIds = selectedValues;

				$rootScope.$apply();
			});
		},
	]
);
