export class ExportDatasetsUseCase {
    constructor(dataSetsDhis2Repository, dataSetsExportSpreadsheetRepository) {
        this.dataSetsDhis2Repository = dataSetsDhis2Repository;
        this.dataSetsExportSpreadsheetRepository = dataSetsExportSpreadsheetRepository;
    }

    execute($resource, dataSetsIds, _headers, locales, removedSections) {
        const translations$ = _.fromPairs(
            locales.map(locale => [
                locale,
                fetch(`${location}/languages/${locale}.json`)
                    .then(response => response.json())
                    .catch(() => undefined),
            ])
        );
        const promises$ = Object.keys(translations$).map(prop => translations$[prop] ?? Promise.resolve(null));
        const translations = Promise.all(promises$).then(results => {
            return Object.keys(translations$).reduce(
                (acc, task, i) => Object.assign(acc, { [Object.keys(translations$)[i]]: results[i] }),
                {}
            );
        });

        return this.dataSetsDhis2Repository
            .get($resource, dataSetsIds)
            .$promise.then(({ dataSets }) => translations.then(translations => ({ translations, dataSets })))
            .then(({ dataSets, translations }) => {
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
                    pickedTranslations: _.intersection(locales, [
                        "en", //add English for default
                        ...dataSet.translations
                            .filter(translation => translation.property === "NAME")
                            .map(translation => translation.locale.split("_")[0]),
                    ]),
                }));

                const translatedDatasets = pickedTranslations.flatMap(mapDataSetTranslations);

                const mappedDatasets = getDataSets(translatedDatasets);

                const dataSetsWithHeaders = mappedDatasets.map(dataSet => {
                    const healthFacility = translations[dataSet.pickedTranslations]?.FACILITY;
                    const reportingPeriod = translations[dataSet.pickedTranslations]?.PERIOD;
                    return {
                        ...dataSet,
                        headers: {
                            healthFacility: healthFacility ? healthFacility + ": " : "",
                            reportingPeriod: reportingPeriod ? reportingPeriod + ": " : "",
                        },
                    };
                });

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
            })
            .catch(err => console.error(err));
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
            (locale === "en" ? categoryOption.name : categoryOption.displayFormName),
    };
}

function mapDataSetTranslations(dataSet) {
    return dataSet.pickedTranslations.map(locale => {
        const mappedDataset = {
            ...dataSet,
            displayFormName:
                getTranslationValue(dataSet.translations, locale) ??
                (locale === "en" ? dataSet.formName ?? dataSet.name : dataSet.displayFormName),
            sections: dataSet.sections.map(section => ({
                ...section,
                //section does not have description available to translate??
                displayName:
                    getTranslationValue(section.translations, locale) ??
                    (locale === "en" ? section.name : section.displayName),
                categoryCombos: section.categoryCombos.map(categoryCombo => ({
                    ...categoryCombo,
                    categories: categoryCombo.categories.map(category => ({
                        categoryOptions: category.categoryOptions.map(co => mapCategoryOption(co, locale)),
                    })),
                    categoryOptionCombos: categoryCombo.categoryOptionCombos.map(coc => {
                        const categoryOptions = coc.categoryOptions.map(co => mapCategoryOption(co, locale));
                        const ids = (locale === "en" ? coc.name : coc.displayFormName)
                            .split(", ")
                            .map(
                                dco =>
                                    coc.categoryOptions.find(
                                        co => (locale === "en" ? co.name : co.displayFormName) === dco
                                    )?.id
                            );
                        const displayFormName = ids
                            .map(id => {
                                const co = categoryOptions.find(co => co.id === id);
                                return locale === "en" ? co?.name : co?.displayFormName;
                            })
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
                        (locale === "en" ? de.formName ?? de.name : de.displayFormName),
                })),
            })),
            dataSetElements: dataSet.dataSetElements.map(dse => ({
                ...dse,
                dataElement: {
                    ...dse.dataElement,
                    displayFormName:
                        getTranslationValue(dse.dataElement.translations, locale, "FORM_NAME") ??
                        getTranslationValue(dse.dataElement.translations, locale, "NAME") ??
                        (locale === "en"
                            ? dse.dataElement.formName ?? dse.dataElement.name
                            : dse.dataElement.displayFormName),
                },
            })),
        };

        return { ...mappedDataset, pickedTranslations: locale };
    });
}

const location = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
