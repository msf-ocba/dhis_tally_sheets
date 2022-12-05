export class GetSelectedDataSetsUseCase {
	constructor(dhisRepository) {
		this.dhisRepository = dhisRepository;
	}

	async execute($resource, dataSetsIds) {
		return await this.dhisRepository
			.get($resource, dataSetsIds)
			.$promise.then(({ dataSets }) => {
				const customDataSets = dataSets.filter(
					(dataset) => dataset.formType === "CUSTOM"
				);
				const sectionedDataSets = dataSets.filter(
					(dataset) => dataset.formType === "SECTION"
				);
				const defaultDataSets = dataSets.filter(
					(dataset) => dataset.formType === "DEFAULT"
				);

				const defaultSections = defaultDataSets.map((dataSet) => ({
					id: dataSet.id,
					title: dataSet.name,
					description: dataSet.displayFormName,
					formType: dataSet.formType,
					dataElements: dataSet.dataSetElements.map(
						({ id, displayFormName }) => ({
							id,
							displayFormName,
						})
					),
				}));

				return [...defaultSections];
			});
	}
}
