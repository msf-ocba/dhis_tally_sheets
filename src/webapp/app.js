import { TallySheets } from "./TallySheets.js";
import { getCompositionRoot } from "../compositionRoot.js";

import "./factories/DataSetsUIDFactory.js";
import "./factories/DataSetEntryForm.js";
import "./factories/LocalesFactory.js";
import "./directives/onFinishRenderDirective.js";
import "./controllers/datasetSelectorController.js";
import "./controllers/datasetFormController.js";
import "./controllers/TallySheetsController.js";
import "./directives/d2ProgressbarDirective.js";
import "./directives/datasetSelectorDirective.js";
import "./directives/datasetFormDirective.js";

export const dhisUrl = window.location.href.split("api/apps/")[0];
export const apiUrl = dhisUrl + "api";
export const compositionRoot = getCompositionRoot();

TallySheets.config(function ($translateProvider) {
	$translateProvider.useStaticFilesLoader({
		prefix: "languages/",
		suffix: ".json",
	});

	$translateProvider.registerAvailableLanguageKeys(["es", "fr", "en", "pt"], {
		"en*": "en",
		"es*": "es",
		"fr*": "fr",
		"pt*": "pt",
		"*": "en", // must be last!
	});

	$translateProvider.fallbackLanguage(["en"]);

	jQuery
		.ajax({
			url: apiUrl + "/userSettings/keyUiLocale/",
			contentType: "text/plain",
			method: "GET",
			dataType: "text",
			async: false,
		})
		.success(function (uiLocale) {
			if (uiLocale == "") {
				$translateProvider.determinePreferredLanguage();
			} else {
				$translateProvider.use(uiLocale);
			}
		})
		.fail(function () {
			$translateProvider.determinePreferredLanguage();
		});
});
