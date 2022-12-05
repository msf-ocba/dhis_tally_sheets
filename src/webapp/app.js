import { TallySheets } from "./TallySheets.js";
import { DataSetsUIDFactory } from "./factories/DataSetsUIDFactory.js";
import { DataSetEntryFormFactory } from "./factories/DataSetEntryForm.js";
import { LocalesFactory } from "./factories/LocalesFactory.js";
import { onFinishRenderDirective } from "./directives/onFinishRenderDirective.js";
import { d2ProgressbarDirective } from "./directives/d2ProgressbarDirective.js";
import { datasetSelectorDirective } from "./directives/datasetSelectorDirective.js";
import { datasetFormDirective } from "./directives/datasetFormDirective.js";
import { datasetSelectorController } from "./controllers/datasetSelectorController.js";
import { datasetFormController } from "./controllers/datasetFormController.js";
import { TallySheetsController } from "./controllers/TallySheetsController.js";

const config = {
	factories: [DataSetsUIDFactory, LocalesFactory, DataSetEntryFormFactory],
	directives: [
		onFinishRenderDirective,
		d2ProgressbarDirective,
		datasetSelectorDirective,
		datasetFormDirective,
	],
	controllers: [
		datasetSelectorController,
		datasetFormController,
		TallySheetsController,
	],
};

export const dhisUrl = window.location.href.split("api/apps/")[0];
export const apiUrl = dhisUrl + "api";

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
