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

const common = "id,name,displayFormName,translations";

const fields = `
	${common},
	displayName,
	formType,
	sections[
		id,
		translations,
		name,
		displayName,
		description,
		categoryCombos[
			id,
			categories[categoryOptions[${common}]],
			categoryOptionCombos[
				id,
				name,
				displayFormName,
				categoryOptions[${common}]
			]
		],
		dataElements[${common},categoryCombo],
		greyedFields[dataElement,categoryOptionCombo]
	],
	dataSetElements[categoryCombo[id,displayName,categories[*],categoryOptionCombos[*]],dataElement[${common}]],
`.replaceAll(/\s/g, "");
