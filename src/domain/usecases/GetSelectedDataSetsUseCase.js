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
						dataSetElements: dataSet.dataSetElements.map(
							({ dataElement }) => dataElement
						),
						sections: dataSet.sections.map(mapSection),
					};
					return [mappedDataSets];
				})
			);
	}
}

function mapSection(section) {
	const mappedCategoryCombos = section.categoryCombos.map((categoryCombo) => {
		const categories = categoryCombo.categories.map(({ categoryOptions }) =>
			categoryOptions.map(({ displayFormName }) => displayFormName)
		);

		const categoryOptionCombos = categoryCombo.categoryOptionCombos
			.map((categoryOptionCombo) => ({
				...categoryOptionCombo,
				categories: categoryOptionCombo.displayFormName.split(", "),
			}))
			.filter((categoryOptionCombo) => {
				const flatCategories = categories.flat();
				const includesInCategories =
					categoryOptionCombo.categories.every((category) =>
						flatCategories.includes(category)
					);
				const sameCategoriesLength =
					categoryOptionCombo.categoryOptions.length ===
					categoryCombo.categories.length;

				return includesInCategories && sameCategoriesLength;
			});

		const dataElements = section.dataElements.filter(
			(de) => de.categoryCombo.id === categoryCombo.id
		);

		const deIds = dataElements.map(({ id }) => id);
		const cocIds = categoryOptionCombos.map(({ id }) => id);

		const greyedFields = section.greyedFields.filter(
			(gf) =>
				deIds.includes(gf.dataElement.id) &&
				cocIds.includes(gf.categoryOptionCombo.id)
		);

		return {
			...categoryCombo,
			categoryOptionCombos,
			categories,
			dataElements,
			greyedFields,
		};
	});

	//Order category combos by the ones that comes first on the dataset dataElements
	//Needed when multiple dataElements differ on categoryCombo
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
			categoryOptionCombos: _.orderBy(
				categoryCombo.categoryOptionCombos,
				(categoryOptionCombo) => {
					//Assign to each word of the (displayFormName) the index where it appears on categoryCombo.categories[]
					//Output: [1, 2, 0]
					const prio = categoryOptionCombo.categories.map(
						(category) => getPrio(categoryCombo, category)
					);

					//Gives lower priority as [N] increases and does a sum of all values
					//[1, 2, 0] -> [100, 20, 0] -> 120
					return prio
						.map(
							(v, idx) => v * Math.pow(10, prio.length - 1 - idx)
						)
						.reduce((a, b) => a + b, 0);
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
