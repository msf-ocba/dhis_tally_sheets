import { TallySheets } from "../TallySheets.js";

export const exportButtonDirective = TallySheets.directive(
	"exportButton",
	function () {
		return (scope, element, attrs) => {
			attrs.$observe("exportButton", (value) => {
				if (_.isEmpty(JSON.parse(value)))
					_.first(element).disabled = true;
				else _.first(element).disabled = false;
			});
		};
	}
);
