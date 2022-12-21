export class ExportDatasetsUseCase {
	constructor(dhisRepository, xlsxRepository) {
		this.dhisRepository = dhisRepository;
		this.xlsxRepository = xlsxRepository;
	}

	execute($resource, dataSetsIds, headers, locales) {
		return this.dhisRepository
			.get($resource, dataSetsIds)
			.$promise.then(({ dataSets }) => {
				const pickedTranslations = dataSets.map((dataSet) => ({
					...dataSet,
					pickedTranslations: _.intersection(
						locales,
						dataSet.translations
							.filter(
								(translation) => translation.property === "NAME"
							)
							.map(
								(translation) =>
									translation.locale.split("_")[0]
							)
					),
				}));
				const translatedDatasets = pickedTranslations.flatMap(
					mapDataSetTranslations
				);
				const mappedDatasets = this.dhisRepository.getDataSets([
					...translatedDatasets,
					...dataSets,
				]);
				const dataSetsWithHeaders = mappedDatasets.map((dataSet) => ({
					...dataSet,
					headers: headers.find(({ id }) => id === dataSet.id),
				}));

				return this.xlsxRepository.createFiles(dataSetsWithHeaders);
			})
			.then((blobFiles) => {
				if (blobFiles.length > 1) {
					const zip = new JSZip();
					blobFiles.forEach((file) =>
						zip.file(sanitizeFileName(file.name), file.blob)
					);

					return zip.generateAsync({ type: "blob" }).then((blob) => {
						saveAs(blob, "MSF-OCBA HMIS.zip");
					});
				} else if (blobFiles.length === 1) {
					const file = blobFiles[0];

					return file?.blob.then((blob) =>
						saveAs(blob, sanitizeFileName(file.name))
					);
				}
			});
	}
}

function sanitizeFileName(str) {
	return str
		.replaceAll("<", "less than")
		.replaceAll(">", "greater than")
		.replaceAll(/[\\/]/g, "_")
		.replace(/[^\p{L}\s\d\-_~,;\[\]\(\).'{}]/gisu, "");
}

function getTranslationValue(translations, locale, property = "NAME") {
	return translations.find(
		(translation) =>
			translation.locale === locale && translation.property === property
	)?.value;
}

function mapCategoryOption(categoryOption, locale) {
	return {
		...categoryOption,
		displayFormName:
			getTranslationValue(
				categoryOption.translations,
				locale,
				"FORM_NAME"
			) ??
			getTranslationValue(categoryOption.translations, locale, "NAME") ??
			categoryOption.displayFormName,
	};
}

function mapDataSetTranslations(dataSet) {
	return dataSet.pickedTranslations.map((locale) => {
		const mappedDataset = {
			...dataSet,
			displayFormName:
				getTranslationValue(dataSet.translations, locale) ??
				dataSet.displayFormName,
			sections: dataSet.sections.map((section) => ({
				...section,
				//section does not have description available to translate??
				displayName:
					getTranslationValue(section.translations, locale) ??
					section.displayName,
				categoryCombos: section.categoryCombos.map((categoryCombo) => ({
					...categoryCombo,
					categories: categoryCombo.categories.map((category) => ({
						categoryOptions: category.categoryOptions.map((co) =>
							mapCategoryOption(co, locale)
						),
					})),
					categoryOptionCombos:
						categoryCombo.categoryOptionCombos.map((coc) => {
							const categoryOptions = coc.categoryOptions.map(
								(co) => mapCategoryOption(co, locale)
							);
							const ids = coc.displayFormName
								.split(", ")
								.map(
									(dco) =>
										coc.categoryOptions.find(
											(co) => co.displayFormName === dco
										)?.id
								);
							const displayFormName = ids
								.map(
									(id) =>
										categoryOptions.find(
											(co) => co.id === id
										)?.displayFormName
								)
								.join(", ");

							return {
								...coc,
								displayFormName,
								categoryOptions,
							};
						}),
				})),
				dataElements: section.dataElements.map((de) => ({
					...de,
					displayFormName:
						getTranslationValue(
							de.translations,
							locale,
							"FORM_NAME"
						) ??
						getTranslationValue(de.translations, locale, "NAME") ??
						de.displayFormName,
				})),
			})),
			dataSetElements: dataSet.dataSetElements.map((dse) => ({
				...dse,
				dataElement: {
					...dse.dataElement,
					displayFormName:
						getTranslationValue(
							dse.dataElement.translations,
							locale,
							"FORM_NAME"
						) ??
						getTranslationValue(
							dse.dataElement.translations,
							locale,
							"NAME"
						) ??
						dse.dataElement.displayFormName,
				},
			})),
		};

		return { ...mappedDataset, pickedTranslations: locale };
	});
}
