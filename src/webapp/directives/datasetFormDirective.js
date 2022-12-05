import { TallySheets } from "../TallySheets.js";

export const datasetFormDirective = TallySheets.directive(
	"datasetForm",
	function () {
		return {
			restrict: "E",
			templateUrl: "assets/views/datasetFormView.html",
			scope: {
				dataset: "=",
				selectorId: "@",
			},
		};
	}
);
