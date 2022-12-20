import { TallySheets } from "./TallySheets.js";
import { DataSetsUIDFactory as _DataSetsUIDFactory } from "./factories/DataSetsUIDFactory.js";
import { DataSetEntryFormFactory as _DataSetEntryFormFactory } from "./factories/DataSetEntryForm.js";
import { LocalesFactory as _LocalesFactory } from "./factories/LocalesFactory.js";
import { onFinishRenderDirective as _onFinishRenderDirective } from "./directives/onFinishRenderDirective.js";
import { d2ProgressbarDirective as _d2ProgressbarDirective } from "./directives/d2ProgressbarDirective.js";
import { datasetSelectorDirective as _datasetSelectorDirective } from "./directives/datasetSelectorDirective.js";
import { datasetFormDirective as _datasetFormDirective } from "./directives/datasetFormDirective.js";
import { datasetSelectorController as _datasetSelectorController } from "./controllers/datasetSelectorController.js";
import { datasetFormController as _datasetFormController } from "./controllers/datasetFormController.js";
import { TallySheetsController as _TallySheetsController } from "./controllers/TallySheetsController.js";
import { getCompositionRoot } from "../compositionRoot.js";

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
