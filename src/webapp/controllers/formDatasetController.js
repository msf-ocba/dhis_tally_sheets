import { TallySheets } from "../TallySheets.js";

export const formDatasetController = TallySheets.controller("formDatasetCtrl", [
	"$scope",
	"$sce",
	($scope, $sce) => {
		$scope.deliberatelyTrustDangerousSnippet = function () {
			return $sce.trustAsHtml($scope.outputHtml);
		};
	},
]);
