import { TallySheets } from "../TallySheets.js";
import { apiUrl } from "../app.js";

export const DataSetsUIDFactory = TallySheets.factory("DataSetsUID", [
	"$resource",
	function ($resource) {
		return $resource(
			apiUrl + "/dataSets.json",
			{},
			{
				get: {
					method: "GET",
					params: {
						fields: "id,displayName,translations,attributeValues[value,attribute]",
						translate: "true",
						paging: false,
					},
				},
			}
		);
	},
]);
