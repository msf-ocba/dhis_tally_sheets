export class GetSelectedDataSetsUseCase {
	constructor(dhisRepository) {
		this.dhisRepository = dhisRepository;
	}

	async execute($resource, dataSetsIds) {
		return await this.dhisRepository
			.get($resource, dataSetsIds)
			.$promise.then(({ dataSets }) =>
				dataSets.flatMap((dataSet) => {
					if (dataSet.formType === "CUSTOM") return [];
					const mappedDataSets = {
						...dataSet,
						sections: dataSet.sections.map(mapSection),
					};
					return [mappedDataSets];
				})
			);
	}
}

function mapSection(section) {
	const mappedCategoryCombos = section.categoryCombos.map((categoryCombo) => {
		const categoryOptionCombos = categoryCombo.categoryOptionCombos.map(
			(categoryOptionCombo) => ({
				...categoryOptionCombo,
				categories: categoryOptionCombo.displayFormName.split(", "),
			})
		);

		const categories = categoryCombo.categories.map(({ categoryOptions }) =>
			categoryOptions.map(({ displayFormName }) => displayFormName)
		);

		const dataElements = section.dataElements.filter(
			(de) => de.categoryCombo.id === categoryCombo.id
		);

		return {
			...categoryCombo,
			categoryOptionCombos,
			categories,
			dataElements,
		};
	});

	const orderedCategoryCombos = _.orderBy(
		mappedCategoryCombos,
		(categoryCombo) =>
			section.dataElements.findIndex(
				(de) => de.categoryCombo.id === categoryCombo.id
			)
	);

	const categoryCombos = orderedCategoryCombos.map((categoryCombo) => {
		return {
			...categoryCombo,
			categoryOptionCombos: categoryCombo.categoryOptionCombos.sort(
				(a, b) => {
					const aPrio = a.categories.map((category) =>
						getPrio(categoryCombo, category)
					);
					const bPrio = b.categories.map((category) =>
						getPrio(categoryCombo, category)
					);

					let index = 0;
					let order = 0;
					while (
						order == 0 &&
						index < categoryCombo.categories.length
					) {
						if (aPrio[index] < bPrio[index]) return -1;
						else if (aPrio[index] > bPrio[index]) return 1;
						else index++;
					}
					return 0;
				}
			),
		};
	});

	return {
		...section,
		categoryCombos,
	};
}

function getPrio(categoryCombo, category) {
	const categories = categoryCombo.categories.flat();
	return categories.indexOf(category);
}
