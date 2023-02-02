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
						fields: "id,formType,displayName,translations,attributeValues[value,attribute[id,name]]",
						filter: "formType:!eq:CUSTOM",
						translate: "true",
						paging: false,
					},
				},
			}
		);
	},
]);
