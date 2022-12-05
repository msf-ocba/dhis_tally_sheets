import { TallySheets } from "../TallySheets.js";

export const onFinishRenderDirective = TallySheets.directive(
	"onFinishRender",
	function ($timeout) {
		return {
			restrict: "A",
			link: function (scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function () {
						scope.$emit("ngRepeatFinished");
					});
				}
			},
		};
	}
);
