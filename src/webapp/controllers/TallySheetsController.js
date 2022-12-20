import { TallySheets } from "../TallySheets.js";
import { dhisUrl, apiUrl, compositionRoot } from "../app.js";

export const TallySheetsController = TallySheets.controller(
	"TallySheetsController",
	[
		"$scope",
		"$resource",
		function ($scope, $resource) {
			var dsSelectorLastId = -1;
			$scope.dsSelectorList = [];

			// Set "headers" to true by default
			$scope.headers = true;

			$scope.addDatasetSelector = function () {
				dsSelectorLastId++;
				$scope.dsSelectorList.push({
					id: dsSelectorLastId,
					dataset: {},
				});
			};

			$scope.clearForm = function () {
				$("#datasetForms").children().remove();
			};

			$scope.exportToTable = function (tableId) {
				const ids = getSelectedDataSets();

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

				const headers = getHeaders();

				// GET LANGS
				// $scope.selectedLangs = [];
				// var languageForm = document.querySelector("#languageSelector");
				// $(languageForm).on("change", "#" + $scope.id, function () {
				// 	var formData = new FormData(languageForm);
				// 	$scope.selectedLangs = formData.getAll("language");
				// 	console.log($scope.selectedLangs);
				// 	$rootScope.$apply();
				// });

				if (!_.isEmpty(ids))
					compositionRoot.dataSets.getSelected
						.execute($resource, ids.join(","))
						.then((dataSets) => {
							const dataSetsWithHeaders = dataSets.map(
								(dataSet) => ({
									...dataSet,
									headers: headers.find(
										({ id }) => id === dataSet.id
									),
								})
							);
							compositionRoot.export.createFiles
								.execute(dataSetsWithHeaders)
								.then((blobFiles) => {
									var zip = new JSZip();
									zip.file(name, format(template, ctx));
									blobFiles.forEach(
										(file) => zip.file(file.name, file.blob) //TODO: REGEX NAME
									);
									zip.generateAsync({ type: "blob" }).then(
										(blob) => {
											saveAs(blob, "MSF-OCBA HMIS.zip");
										}
									);
								});
						});

				//Create a fake link to download the file
				// var link = angular.element('<a class="hidden" id="idlink"></a>');
				// link.attr({
				//   href: uri + base64(format(template, ctx)),
				//   target: "_blank",
				//   download: name,
				// });
				// $("body").prepend(link[0].outerHTML);
				// $("#idlink")[0].click();
				// $("#idlink")[0].remove();
			};

			$scope.goHome = function () {
				window.location.replace(dhisUrl);
			};

			// Initialize the app with one dataset selector
			$scope.addDatasetSelector();
		},
	]
);

function getSelectedDataSets() {
	//Temporal workaround, expected to be deleted on future
	//Split array in pairs of 2 because dataset and language <select/> elements have same id
	const selects = _.chunk(
		[...document.querySelectorAll("select[id^=dsSelector]")],
		2
	).map(([datasets, locales]) => ({
		ids: [...datasets.selectedOptions].map((option) => option.value),
		locale: [...locales.selectedOptions].map((option) => option.value),
	}));

	const ids = _.uniq(selects.flatMap((select) => select.ids));

	return ids;
}

function getHeaders() {
	const dataSetForms = [...document.querySelectorAll(".dataset-form")];
	const headers = dataSetForms.flatMap((form) => {
		const [healthFacility, reportingPeriod, dataSetName] = [
			...form.querySelectorAll(".dsTitle"),
		].map((input) => input.value);
		return {
			id: form.dataset.id,
			healthFacility,
			reportingPeriod,
			dataSetName,
		};
	});

	return _.orderBy(headers, ({ index }) => index);
}
