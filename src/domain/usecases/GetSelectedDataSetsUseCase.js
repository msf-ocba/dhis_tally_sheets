export class GetSelectedDataSetsUseCase {
	constructor(dhisRepository) {
		this.dhisRepository = dhisRepository;
	}

	execute($resource, dataSetsIds) {
		console.log(this.dhisRepository.get($resource, dataSetsIds));
		const x = this.dhisRepository
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
					title: dataSet.name,
					description: dataSet.displayFormName,
				}));

				console.log("custom: ", customDataSets);
				console.log("sectioned: ", sectionedDataSets);
				console.log("default: ", defaultDataSets);
				console.log(defaultSections);
			});
		return x;
	}
}
