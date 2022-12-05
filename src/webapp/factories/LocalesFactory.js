import { TallySheets } from "../TallySheets.js";
import { apiUrl } from "../app.js";

export const LocalesFactory = TallySheets.factory("Locales", [
	"$resource",
	function ($resource) {
		return $resource(
			apiUrl + "/29/locales/dbLocales.json",
			{},
			{
				get: {
					method: "GET",
					params: {
						fields: "name,locale",
						translate: "true",
						paging: false,
					},
					isArray: true,
				},
			}
		);
	},
]);
