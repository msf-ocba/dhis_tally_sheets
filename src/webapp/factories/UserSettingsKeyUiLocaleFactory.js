import { TallySheets } from "../TallySheets.js";
import { apiUrl } from "../app.js";

export const UserSettingsKeyUiLocaleFactory = TallySheets.factory("UserSettingsKeyUiLocale", [
    "$resource",
    function ($resource) {
        return $resource(
            apiUrl + "/userSettings/keyUiLocale/",
            {},
            {
                get: {
                    method: "GET",
                    transformResponse: function (response) {
                        return { response };
                    },
                },
            }
        );
    },
]);
