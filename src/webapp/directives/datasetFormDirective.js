import { TallySheets } from "../TallySheets.js";

export const datasetFormDirective = TallySheets.directive(
	"datasetForm",
	function () {
		return {
			restrict: "E",
			templateUrl: "src/views/datasetFormView.html",
			scope: {
				dataset: "=",
				selectorId: "@",
			},
		};
	}
);
