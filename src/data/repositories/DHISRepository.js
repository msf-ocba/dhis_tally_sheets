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
						fields: "id,name,displayName,formType,displayFormName,sections[:all],dataSetElements[dataElement[:all]]",
						filter: `id:in:[${dataSetsIds}]`,
						paging: false,
					},
				},
			}
		).get();
	}
}
