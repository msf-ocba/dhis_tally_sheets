import { TallySheets } from "../TallySheets.js";

export const formDirective = TallySheets.directive("formDataset", function () {
	return {
		restrict: "E",
		templateUrl: "src/views/formDatasetView.html",
		scope: {
			dataset: "=",
			outputHtml: "=",
		},
	};
});
