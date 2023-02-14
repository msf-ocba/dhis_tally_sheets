import { TallySheets } from "../TallySheets.js";
import { dhisUrl } from "../app.js";

export const DataSetEntryFormFactory = TallySheets.factory("DataSetEntryForm", [
    "$resource",
    function ($resource) {
        return $resource(
            dhisUrl + "dhis-web-dataentry/loadForm.action",
            { dataSetId: "@dataSetId" },
            {
                get: {
                    method: "GET",
                    transformResponse: function (response) {
                        return { codeHtml: response };
                    },
                },
            }
        );
    },
]);
