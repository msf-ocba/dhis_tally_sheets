import { TallySheets } from "../TallySheets.js";

export const onFinishRenderDirective = TallySheets.directive(
	"onFinishRender",
	function ($timeout) {
		return {
			restrict: "A",
			link: (scope, element, attr) => {
				if (scope.formatForm)
					$timeout(() => {
						scope.formatForm(element);
					});
				if (scope.$last === true) {
					$timeout(() => {
						scope.$emit("ngRepeatFinished");
					});
				}
			},
		};
	}
);
