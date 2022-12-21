import { TallySheets } from "../TallySheets.js";

export const datasetSelectorController = TallySheets.controller(
	"datasetSelectorCtrl",
	["$scope", "$rootScope", "DataSetsUID", "Locales", controller]
);

function controller($scope, $rootScope, DataSetsUID, Locales) {
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

	$scope.selected = [];
	$scope.selectedIds = [];

	const datasetForm = document.querySelector("#datasetSelector");
	$(datasetForm).on("change", "#" + $scope.id, () => {
		// FORM
		const formData = new FormData(datasetForm);
		const selectedValues = formData.getAll("dataset");

		var dsId =
			selectedValues.find(
				(selected) => !$scope.selectedIds.includes(selected)
			) ?? null;

		const dsName = $scope.dataSetList.find(
			(dataSet) => dataSet.id === dsId
		)?.displayName;

		const languageList = $scope.dataSetList
			.find((dataSet) => dataSet.id === dsId)
			?.translations?.filter(
				(translation) => translation.property === "NAME"
			);

		$scope.languageList = $scope.languages.filter((lang) =>
			languageList?.some(
				(language) => language.locale.split("_")[0] === lang.locale
			)
		);

		$scope.selected = selectedValues;

		$scope.bindToDataset.id = dsId;
		$scope.bindToDataset.name = dsName;
		$scope.bindToDataset.selectedIds = selectedValues;
		$scope.bindToDataset.selected = $scope.selected;

		$scope.selectedIds = selectedValues;

		$rootScope.$apply();

		// EXPORT BUTTON
		const exportButton = document.getElementById("export-button");
		if (exportButton) {
			if (_.isEmpty(selectedValues)) exportButton.disabled = true;
			else exportButton.disabled = false;
		}
	});
}
