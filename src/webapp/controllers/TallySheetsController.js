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
			$scope.includeHeaders = true;
			$scope.datasets = [];
			$scope.selectedDatasets = [];
			$scope.availableLanguages = [];
			$scope.selectedLocales = [];
			$scope.progressbarDisplayed = false;
			$scope.selectorsLoaded = false;
			$scope.selectAllLangs = false;
			$scope.removedSections = [];

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

			$scope.$on("ngRepeatFinished", function (ngRepeatFinishedEvent) {
				// Refresh bootstrap-select
				$(".selectpicker").selectpicker("refresh");
				$(".selectpicker").selectpicker("render");
				$scope.selectorsLoaded = true;
			});

			const datasetSelectorForm = document.getElementById(
				"datasetSelectorForm"
			);
			const languageSelectorForm = document.getElementById(
				"languageSelectorForm"
			);

			$(datasetSelectorForm).on("change", () => {
				$scope.progressbarDisplayed = true;
				$scope.selectorsLoaded = false;

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
					availableLocales?.includes(lang.locale)
				);

				$scope.$apply(() => {
					$scope.selectedDatasets = selectedDatasets;
					$scope.availableLanguages = availableLanguages;
					if ($scope.selectAllLangs)
						$scope.selectedLocales = availableLocales;
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
								headers: {
									id: dataset.id,
									healthFacility: "Health Facility: ",
									reportingPeriod: "Reporting Period: ",
									dataSetName: dataset.displayName,
								},
								output: codeHtml,
							};
						})
					)
				)
					.then((datasets) => {
						$scope.$apply(() => {
							$("#datasetsForms").children().remove();
							$scope.removedSections = [];
							$scope.forms = datasets;
							$scope.progressbarDisplayed = false;

							$timeout(() => {
								$(".selectpicker").selectpicker("refresh");
								$(".selectpicker").selectpicker("render");
							});

							$timeout(() => {
								//just for visuals
								$scope.selectorsLoaded = true;
							}, 200);
						});
					})
					.catch((err) => {
						console.error(err);
						$scope.selectorsLoaded = true;
					});
			});

			$(languageSelectorForm).on("change", () => {
				const formData = new FormData(languageSelectorForm);
				const selectedLocales = formData.getAll("language");
				$scope.$apply(() => {
					$scope.selectedLocales = selectedLocales;
				});
			});

			$scope.clearForm = () => {
				// $("#datasetsForms").children().remove(); //Commented because not need to remove children. $scope vars will update UI
				$scope.availableLanguages = [];
				$scope.selectedLocales = [];
				$scope.forms = [];
				$scope.selectedDatasets = [];
				$scope.progressbarDisplayed = false;
				$scope.selectorsLoaded = false;
				$scope.removedSections = [];

				_.first(
					datasetSelectorForm.getElementsByTagName("select")
				).value = "";
				_.first(
					languageSelectorForm.getElementsByTagName("select")
				).value = "";

				$timeout(() => {
					$(".selectpicker").selectpicker("refresh");
					$(".selectpicker").selectpicker("render");
				});

				$timeout(() => {
					//just for visuals
					$(".selectpicker").selectpicker("refresh");
					$(".selectpicker").selectpicker("render");
					$scope.selectorsLoaded = true;
				}, 200);
			};

			$scope.goHome = () => {
				window.location.replace(dhisUrl);
			};

			$scope.exportToTable = () => {
				const ids = $scope.selectedDatasets.map(({ id }) => id);
				const headers = $scope.forms.map(({ headers }) => headers);
				const realHeaders = $scope.includeHeaders
					? headers
					: headers.map((header) => ({
							id: headers.id,
							dataSetName: header.displayName,
					  }));

				if (!_.isEmpty(ids))
					compositionRoot.exportToXlsx.execute(
						$resource,
						ids,
						realHeaders,
						$scope.selectedLocales,
						$scope.removedSections
					);
			};

			//In case they toggle the selectAllLang switch after selecting the desired datasets
			$scope.updateLangs = () => {
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

				if ($scope.selectAllLangs)
					$scope.selectedLocales = availableLocales;
				else $scope.selectedLocales = [];
			};
		},
	]
);