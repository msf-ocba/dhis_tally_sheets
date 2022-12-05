export class GetSelectedDataSetsUseCase {
	constructor(dhisRepository) {
		this.dhisRepository = dhisRepository;
	}

	execute($resource, dataSetsIds) {
		return this.dhisRepository
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
					dataElements: dataSet.dataSetElements.map(
						({ id, displayFormName }) => ({
							id,
							displayFormName,
						})
					),
				}));

				return {
					defaultSections,
				};
			});
	}
}
