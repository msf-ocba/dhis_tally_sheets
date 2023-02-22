export class ExportDatasetsUseCase {
    constructor(dataSetsDhis2Repository, dataSetsExportSpreadsheetRepository) {
        this.dataSetsDhis2Repository = dataSetsDhis2Repository;
        this.dataSetsExportSpreadsheetRepository = dataSetsExportSpreadsheetRepository;
    }

    execute($resource, dataSetsIds, headers, locales, removedSections) {
        return this.dataSetsDhis2Repository
            .get($resource, dataSetsIds)
            .$promise.then(({ dataSets }) => {
                const dataSetsWithoutCommentsAndRemovedSections = dataSets.map(dataSet => ({
                    ...dataSet,
                    sections: dataSet.sections.filter(
                        section =>
                            !(
                                section.name.toLowerCase().includes("comments") ||
                                section.displayName.toLowerCase().includes("comments") ||
                                section.displayName.toLowerCase().includes("comentarios") ||
                                section.displayName.toLowerCase().includes("commentaires") ||
                                section.displayName.toLowerCase().includes("comentários") ||
                                section.displayName.toLowerCase().includes("notas") ||
                                removedSections.includes(section.id)
                            )
                    ),
                }));

                const overridedDataSets = dataSetsWithoutCommentsAndRemovedSections.map(dataSet => {
                    const overrides = dataSet.dataSetElements.map(dse => ({
                        categoryComboId: dse.categoryCombo?.id,
                        dataElementId: dse.dataElement.id,
                    }));
                    const overridedSections = dataSet.sections.map(section => ({
                        ...section,
                        dataElements: section.dataElements.map(de => ({
                            ...de,
                            categoryCombo: {
                                id:
                                    overrides.find(o => o.dataElementId === de.id)?.categoryComboId ??
                                    de.categoryCombo.id,
                            },
                        })),
                    }));

                    return {
                        ...dataSet,
                        sections: overridedSections,
                    };
                });

                const pickedTranslations = overridedDataSets.map(dataSet => ({
                    ...dataSet,
                    pickedTranslations: _.intersection(
                        locales,
                        dataSet.translations
                            .filter(translation => translation.property === "NAME")
                            .map(translation => translation.locale.split("_")[0])
                    ),
                }));

                const translatedDatasets = pickedTranslations.flatMap(mapDataSetTranslations);

                const mappedDatasets = getDataSets(_.isEmpty(locales) ? overridedDataSets : translatedDatasets);

                const dataSetsWithHeaders = mappedDatasets.map(dataSet => ({
                    ...dataSet,
                    headers: headers.find(({ id }) => id === dataSet.id),
                }));

                return this.dataSetsExportSpreadsheetRepository.createFiles(dataSetsWithHeaders);
            })
            .then(blobFiles => {
                if (blobFiles.length > 1) {
                    const zip = new JSZip();
                    const names = [];
                    blobFiles.forEach(file => {
                        const name = sanitizeFileName(file.name);
                        const idx = names.filter(s => s === name).length;
                        zip.file(name + (idx ? ` (${idx})` : "") + ".xlsx", file.blob);
                        names.push(name);
                    });

                    return zip.generateAsync({ type: "blob" }).then(blob => {
                        saveAs(blob, "MSF-OCBA HMIS.zip");
                    });
                } else if (blobFiles.length === 1) {
                    const file = blobFiles[0];

                    return file?.blob.then(blob => saveAs(blob, sanitizeFileName(file.name)));
                }
            });
    }
}

function getDataSets(dataSets) {
    const mappedDatasets = dataSets.flatMap(dataSet => {
        if (dataSet.formType === "CUSTOM") return [];

        const mappedDataSets = {
            ...dataSet,
            dataSetElements: dataSet.dataSetElements.map(({ dataElement }) => dataElement),
            sections: dataSet.sections.map(mapSection),
        };

        return [mappedDataSets];
    });

    return mappedDatasets;
}

function mapSection(section) {
    const mappedCategoryCombos = section.categoryCombos.map(categoryCombo => {
        const categories = categoryCombo.categories.map(({ categoryOptions }) =>
            categoryOptions.map(({ displayFormName }) => displayFormName)
        );

        const categoriesOrder = categoryCombo.categories.map(({ categoryOptions }) =>
            categoryOptions.map(({ id }) => id)
        );

        const categoryOptionCombos = categoryCombo.categoryOptionCombos
            .map(categoryOptionCombo => ({
                ...categoryOptionCombo,
                categories: _.sortBy(categoryOptionCombo.categoryOptions, ({ id }) =>
                    categoriesOrder.findIndex(c => c.includes(id))
                ).map(({ displayFormName }) => displayFormName),
            }))
            .filter(categoryOptionCombo => {
                const flatCategories = categories.flat();
                const includesInCategories = categoryOptionCombo.categories.every(category =>
                    flatCategories.includes(category)
                );
                const sameCategoriesLength =
                    categoryOptionCombo.categoryOptions.length === categoryCombo.categories.length;

                return includesInCategories && sameCategoriesLength;
            });

        const dataElements = section.dataElements.filter(de => de.categoryCombo.id === categoryCombo.id);

        const deIds = dataElements.map(({ id }) => id);
        const cocIds = categoryOptionCombos.map(({ id }) => id);

        const greyedFields = section.greyedFields.filter(
            gf => deIds.includes(gf.dataElement.id) && cocIds.includes(gf.categoryOptionCombo?.id)
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
    const orderedCategoryCombos = _.sortBy(mappedCategoryCombos, categoryCombo =>
        section.dataElements.findIndex(de => de.categoryCombo.id === categoryCombo.id)
    );

    const categoryCombos = orderedCategoryCombos.map(categoryCombo => {
        return {
            ...categoryCombo,
            categoryOptionCombos: _.sortBy(categoryCombo.categoryOptionCombos, categoryOptionCombo => {
                //Assign to each word of the (displayFormName) the index where it appears on categoryCombo.categories[]
                //Output: [1, 2, 0]
                const prio = categoryOptionCombo.categories.map(category => getPrio(categoryCombo, category));

                //Gives lower priority as [N] increases and does a sum of all values
                //[1, 2, 0] -> [100, 20, 0] -> 120
                return prio.map((v, idx) => v * Math.pow(10, prio.length - 1 - idx)).reduce((a, b) => a + b, 0);
            }),
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

function sanitizeFileName(str) {
    return str
        .replaceAll("<", "less than")
        .replaceAll(">", "greater than")
        .replaceAll(/[\\/]/g, "_")
        .replace(/[^\p{L}\s\d\-_~,;\[\]\(\).'{}]/gisu, "");
}

function getTranslationValue(translations, locale, property = "NAME") {
    return translations.find(translation => translation.locale === locale && translation.property === property)?.value;
}

function mapCategoryOption(categoryOption, locale) {
    return {
        ...categoryOption,
        displayFormName:
            getTranslationValue(categoryOption.translations, locale, "FORM_NAME") ??
            getTranslationValue(categoryOption.translations, locale, "NAME") ??
            categoryOption.displayFormName,
    };
}

function mapDataSetTranslations(dataSet) {
    return dataSet.pickedTranslations.map(locale => {
        const mappedDataset = {
            ...dataSet,
            displayFormName: getTranslationValue(dataSet.translations, locale) ?? dataSet.displayFormName,
            sections: dataSet.sections.map(section => ({
                ...section,
                //section does not have description available to translate??
                displayName: getTranslationValue(section.translations, locale) ?? section.displayName,
                categoryCombos: section.categoryCombos.map(categoryCombo => ({
                    ...categoryCombo,
                    categories: categoryCombo.categories.map(category => ({
                        categoryOptions: category.categoryOptions.map(co => mapCategoryOption(co, locale)),
                    })),
                    categoryOptionCombos: categoryCombo.categoryOptionCombos.map(coc => {
                        const categoryOptions = coc.categoryOptions.map(co => mapCategoryOption(co, locale));
                        const ids = coc.displayFormName
                            .split(", ")
                            .map(dco => coc.categoryOptions.find(co => co.displayFormName === dco)?.id);
                        const displayFormName = ids
                            .map(id => categoryOptions.find(co => co.id === id)?.displayFormName)
                            .join(", ");

                        return {
                            ...coc,
                            displayFormName,
                            categoryOptions,
                        };
                    }),
                })),
                dataElements: section.dataElements.map(de => ({
                    ...de,
                    displayFormName:
                        getTranslationValue(de.translations, locale, "FORM_NAME") ??
                        getTranslationValue(de.translations, locale, "NAME") ??
                        de.displayFormName,
                })),
            })),
            dataSetElements: dataSet.dataSetElements.map(dse => ({
                ...dse,
                dataElement: {
                    ...dse.dataElement,
                    displayFormName:
                        getTranslationValue(dse.dataElement.translations, locale, "FORM_NAME") ??
                        getTranslationValue(dse.dataElement.translations, locale, "NAME") ??
                        dse.dataElement.displayFormName,
                },
            })),
        };

        return { ...mappedDataset, pickedTranslations: locale };
    });
}
