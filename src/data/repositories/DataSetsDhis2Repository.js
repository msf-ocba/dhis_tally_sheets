import { apiUrl } from "../../webapp/app.js";

export class DataSetsDhis2Repository {
	get($resource, dataSetsIds) {
		return $resource(
			apiUrl + "/dataSets.json",
			{},
			{
				get: {
					method: "GET",
					params: {
						fields: fields,
						filter: `id:in:[${dataSetsIds.join(",")}]`,
						paging: false,
					},
				},
			}
		).get();
	}
}

const common = "id,displayFormName,translations";

const fields = `
	id,
	name,
	displayName,
	formType,
	displayFormName,
	sections[
		translations,
		displayName,
		description,
		categoryCombos[
			id,
			categories[categoryOptions[${common}]],
			categoryOptionCombos[
				id,
				displayFormName,
				categoryOptions[${common}]
			]
		],
		dataElements[${common},categoryCombo],
		greyedFields[dataElement,categoryOptionCombo]
	],
	dataSetElements[categoryCombo[id,displayName,categories[*],categoryOptionCombos[*]],dataElement[${common}]],
	translations
`.replaceAll(/\s/g, "");
