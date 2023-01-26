import { TallySheets } from "../TallySheets.js";
import { dhisUrl, apiUrl, compositionRoot } from "../app.js";

export const TallySheetsController = TallySheets.controller(
	"TallySheetsController",
	[
		"$scope",
		"$resource",
		"$timeout",
		"DataSetsUID",
		"Locales",
		"DataSetEntryForm",
		function (
			$scope,
			$resource,
			$timeout,
			DataSetsUID,
			Locales,
			DataSetEntryForm
		) {
			$scope.id = 0;
			$scope.dataset = {};

			$scope.includeHeaders = true;
			$scope.datasets = [];
			$scope.selectedDatasets = [];
			$scope.availableLanguages = [];
			$scope.progressbarDisplayed = false;
			$scope.selectorsLoaded = false;

			Locales.get().$promise.then((result) => {
				$scope.languages = result;
			});

			DataSetsUID.get().$promise.then((result) => {
				$scope.datasets = result.dataSets.filter(
					(dataset) =>
						!dataset.attributeValues.some(
							(att) =>
								att.attribute.name === "hideInTallySheet" &&
								att.value === "true"
						)
				);

				$scope.selectorsLoaded = true;
			});

			const datasetSelectorForm = document.getElementById(
				"datasetSelectorForm"
			);

			$(datasetSelectorForm).on("change", () => {
				$scope.progressbarDisplayed = true;
				$scope.selectorLoaded = false;

				// FORM
				const formData = new FormData(datasetSelectorForm);
				const selectedIds = formData.getAll("dataset");
				const selectedDatasets = $scope.datasets.filter((dataset) =>
					selectedIds.includes(dataset.id)
				);

				const availableLocales = _.uniq(
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

				const availableLanguages = $scope.languages.filter((lang) =>
					availableLocales?.some(
						(language) => language === lang.locale
					)
				);

				$scope.$apply(() => {
					$scope.selectedDatasets = selectedDatasets;
					$scope.availableLanguages = availableLanguages;
				});

				Promise.all(
					selectedDatasets.map((dataset) =>
						DataSetEntryForm.get({
							dataSetId: dataset.id,
						}).$promise.then((result) => {
							const codeHtml = result.codeHtml.replace(
								/id="tabs"/g,
								`id="tabs-${dataset.id}"`
							);

							return {
								dataset,
								output: codeHtml,
							};
						})
					)
				).then((datasets) => {
					$scope.$apply(() => {
						$scope.forms = datasets;
						$scope.clearForm();
						$scope.progressbarDisplayed = false;
						$timeout(() => {
							$(".selectpicker").selectpicker("refresh");
							$(".selectpicker").selectpicker("render");
						});
					});
				});
			});

			$scope.clearForm = () => {
				$("#datasetsForms1").children().remove();
			};

			$scope.goHome = () => {
				window.location.replace(dhisUrl);
			};

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
