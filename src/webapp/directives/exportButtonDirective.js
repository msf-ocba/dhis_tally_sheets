import { TallySheets } from "../TallySheets.js";

export const exportButtonDirective = TallySheets.directive("exportButton", function () {
    return (scope, element, attrs) => {
        attrs.$observe("exportButton", value => {
            const v = JSON.parse(value);
            const { selectedDatasets, selectedLocales, progressbarDisplayed } = v ?? {};
            if (!selectedDatasets || !selectedLocales || progressbarDisplayed) _.first(element).disabled = true;
            else if (_.isEmpty(selectedDatasets) || _.isEmpty(selectedLocales)) _.first(element).disabled = true;
            else _.first(element).disabled = false;
        });
    };
});
