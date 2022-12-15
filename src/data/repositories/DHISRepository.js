import { apiUrl } from "../../webapp/app.js";

export class DHISRepository {
	get($resource, dataSetsIds) {
		return $resource(
			apiUrl + "/dataSets.json",
			{},
			{
				get: {
					method: "GET",
					params: {
						fields: fields,
						filter: `id:in:[${dataSetsIds}]`,
						paging: false,
					},
				},
			}
		).get();
	}
}

const idDisplayFormName = `id,displayFormName`;
const categoryCombos = `categories[categoryOptions[displayFormName]],categoryOptionCombos[${idDisplayFormName},categoryOptions[id,displayFormName,translations]]`;
const section = `translations,displayName,description,categoryCombos[id,${categoryCombos}],dataElements[${idDisplayFormName},translations,categoryCombo],greyedFields[dataElement,categoryOptionCombo]`;

const fields = `id,name,displayName,formType,displayFormName,sections[${section}],dataSetElements[dataElement[translations,${idDisplayFormName}]],translations`;
