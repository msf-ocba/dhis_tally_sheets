import { TallySheets } from "../TallySheets.js";

export const datasetSelectorDirective = TallySheets.directive(
	"datasetSelector",
	function () {
		return {
			restrict: "E",
			templateUrl: "assets/views/datasetSelectorView.html",
			scope: {
				selectorId: "=",
				bindToDataset: "=",
			},
		};
	}
);
