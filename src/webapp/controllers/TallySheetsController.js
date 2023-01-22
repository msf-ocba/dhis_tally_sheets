import { TallySheets } from "../TallySheets.js";
import { dhisUrl, apiUrl, compositionRoot } from "../app.js";

export const TallySheetsController = TallySheets.controller(
	"TallySheetsController",
	[
		"$scope",
		"$resource",
		"DataSetsUID",
		"Locales",
		function ($scope, $resource, DataSetsUID, Locales) {
			$scope.id = 0;
			$scope.dataset = {};

			$scope.datasets = [];
			$scope.selectedDatasets = [];
			$scope.selectedLocales = [];
			$scope.progressbarDisplayed = false;

			Locales.get().$promise.then(function (result) {
				$scope.languages = result;
			});

			DataSetsUID.get().$promise.then(function (result) {
				$scope.datasets = result.dataSets.filter(
					(dataset) =>
						!dataset.attributeValues.some(
							(att) =>
								att.attribute.name === "hideInTallySheet" &&
								att.value === "true"
						)
				);
			});

			const datasetSelectorForm = document.getElementById(
				"datasetSelectorForm"
			);

			$(datasetSelectorForm).on("change", () => {
				// FORM
				const formData = new FormData(datasetSelectorForm);
				const selectedIds = formData.getAll("dataset");
				const selectedDatasets = $scope.datasets.filter((dataset) =>
					selectedIds.includes(dataset.id)
				);
				const selectedLocales = _.uniq(
					selectedDatasets
						.map((dataset) =>
							dataset.translations?.flatMap((translation) =>
								translation.property === "NAME"
									? [translation.locale.split("_")[0]]
									: []
							)
						)
						.flat()
				);

				$scope.$apply(() => {
					$scope.selectedDatasets = selectedDatasets;
					$scope.selectedLocales = selectedLocales;
				});
			});

			// $scope.clearForm = () => {
			// 	$("#datasetForms").children().remove();
			// };

			// $scope.goHome = () => {
			// 	window.location.replace(dhisUrl);
			// };

			// $scope.exportToTable = function (tableId) {
			// 	const ids = getSelectedDataSets();

			// 	var table = $("#" + tableId).clone();

			// 	// Remove non-printable section from the table
			// 	table.find(".hidden-print").remove();
			// 	table.find(".ng-hide").remove();

			// 	// Replace input fields with their values (for correct excel formatting)
			// 	table.find("input").each(function () {
			// 		var value = $(this).val();
			// 		$(this).replaceWith(value);
			// 	});

			// 	// Add border to section table (for printing in MS Excel)
			// 	table.find(".sectionTable").prop("border", "1");

			// 	const headers = getHeaders();

			// 	// GET LANGS
			// 	$scope.selectedLangs = [];
			// 	const languageForm =
			// 		document.querySelector("#languageSelector");
			// 	const formData = new FormData(languageForm);
			// 	$scope.selectedLangs = formData.getAll("language");

			// 	if (!_.isEmpty(ids))
			// 		compositionRoot.exportToXlsx.execute(
			// 			$resource,
			// 			ids.join(","),
			// 			headers,
			// 			$scope.selectedLangs
			// 		);
			// };
		},
	]
);

// function getSelectedDataSets() {
// 	//Temporal workaround, expected to be deleted on future
// 	//Split array in pairs of 2 because dataset and language <select/> elements have same id
// 	const selects = _.chunk(
// 		[...document.querySelectorAll("select[id^=dsSelector]")],
// 		2
// 	).map(([datasets, locales]) => ({
// 		ids: [...datasets.selectedOptions].map((option) => option.value),
// 		locale: [...locales.selectedOptions].map((option) => option.value),
// 	}));

// 	const ids = _.uniq(selects.flatMap((select) => select.ids));

// 	return ids;
// }

// function getHeaders() {
// 	const dataSetForms = [...document.querySelectorAll(".dataset-form")];
// 	const headers = dataSetForms.flatMap((form) => {
// 		const [healthFacility, reportingPeriod, dataSetName] = [
// 			...form.querySelectorAll(".dsTitle"),
// 		].map((input) => input.value);
// 		return {
// 			id: form.dataset.id,
// 			healthFacility,
// 			reportingPeriod,
// 			dataSetName,
// 		};
// 	});

// 	return _.sortBy(headers, ({ index }) => index);
// }
