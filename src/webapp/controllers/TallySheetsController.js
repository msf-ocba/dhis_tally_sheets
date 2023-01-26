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
			$scope.selectedLanguages = [];
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
				// FORM
				const formData = new FormData(languageSelectorForm);
				const selectedLocales = formData.getAll("language");
				const selectedLanguages = $scope.languages.filter((lang) =>
					selectedLocales?.includes(lang.locale)
				);

				$scope.$apply(() => {
					$scope.selectedLanguages = selectedLanguages;
				});
			});

			$scope.clearForm = () => {
				// $("#datasetsForms").children().remove(); //Commented because not need to remove children. $scope vars will update UI
				$scope.availableLanguages = [];
				$scope.selectedLanguages = [];
				$scope.forms = [];
				$scope.selectedDatasets = [];
				$scope.progressbarDisplayed = false;
				$scope.selectorsLoaded = false;

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

				if (!_.isEmpty(ids))
					compositionRoot.exportToXlsx.execute(
						$resource,
						ids,
						headers,
						$scope.selectedLanguages.map(({ locale }) => locale)
					);
			};
		},
	]
);
