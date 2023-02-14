import { TallySheets } from "../TallySheets.js";

export const updateLanguageDirective = TallySheets.directive("updateLanguage", function ($rootScope) {
    return {
        link: function (scope, element) {
            const listener = function (event, translationResp) {
                const defaultLang = "en",
                    currentlang = translationResp.language;

                element.attr("lang", currentlang || defaultLang);
            };

            $rootScope.$on("$translateChangeSuccess", listener);
        },
    };
});
